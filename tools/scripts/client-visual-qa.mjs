import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(path.join(root, 'package.json'));
const { chromium } = require('playwright');
const base = process.env['CLIENT_QA_URL'] ?? 'http://localhost:4200';
const output = path.resolve(process.argv[2] ?? 'dist/client-visual-qa');
fs.mkdirSync(output, { recursive: true });
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--hide-scrollbars'],
  });
} catch {
  browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--hide-scrollbars'],
  });
}
const report = {
  capturedAt: new Date().toISOString(),
  screenshots: [],
  checks: [],
  pageErrors: [],
  forbiddenRequests: [],
};
const routes = [
  ['01-accueil', 'm01-accueil', '/'],
  ['03-resultats', 'm03-resultats', '/resultats?q=hp'],
  [
    '04-fiche-produit',
    'm04-fiche-produit',
    '/produit/samsung-galaxy-s24-128-go',
  ],
  ['05-boutiques-carte', 'm05-boutiques-carte', '/boutiques'],
  [
    '06-carte-sans-position',
    'm06-carte-sans-position',
    '/boutiques?position=refusee',
  ],
  ['07-panier', 'm07-panier', '/panier'],
  ['08-compte-favoris', 'm08-compte-favoris', '/compte'],
  ['09-categories', 'm09-categories', '/categories'],
  ['10-commercants', 'm10-commercants', '/commercants'],
];
async function pageFor(viewport) {
  const context = await browser.newContext({
    viewport: {
      width: viewport === 'desktop' ? 1440 : 390,
      height: viewport === 'desktop' ? 900 : 844,
    },
    deviceScaleFactor: viewport === 'desktop' ? 1 : 2,
    reducedMotion: 'reduce',
  });
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(base).origin || url.protocol === 'data:')
      return route.continue();
    if (
      url.pathname.includes('/functions/v1') ||
      url.pathname.includes('/auth/v1')
    )
      report.forbiddenRequests.push(url.origin + url.pathname);
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', (error) =>
    report.pageErrors.push({ url: page.url(), message: error.message }),
  );
  page.setDefaultTimeout(8000);
  return { page, context };
}
async function ready(page, route) {
  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45000 });
  await page.locator('.tpx-public').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function shot(page, viewport, name, fullPage = true) {
  const destination = path.join(output, viewport, name + '.png');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  await page.screenshot({
    path: destination,
    fullPage,
    animations: 'disabled',
  });
  const data = fs.readFileSync(destination);
  report.screenshots.push({
    viewport,
    name,
    path: destination,
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  });
  console.log('Captured ' + viewport + '/' + name);
}
async function check(name, operation) {
  try {
    await operation();
    report.checks.push({ name, passed: true });
  } catch (error) {
    report.checks.push({ name, passed: false, message: String(error.message) });
    console.log('FAILED ' + name + ': ' + error.message.split('\n')[0]);
  }
}
async function componentShot(page, viewport, name, selector) {
  const destination = path.join(output, viewport, name + '.png');
  await page
    .locator(selector)
    .screenshot({ path: destination, animations: 'disabled' });
  const data = fs.readFileSync(destination);
  report.screenshots.push({
    viewport,
    name,
    path: destination,
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  });
}
const visible = (locator) => locator.filter({ visible: true });
try {
  for (const viewport of ['desktop', 'mobile']) {
    for (const [desktop, mobile, route] of routes) {
      const { page, context } = await pageFor(viewport);
      await ready(page, route);
      await shot(page, viewport, viewport === 'desktop' ? desktop : mobile);
      if (route === '/') {
        await componentShot(
          page,
          viewport,
          viewport === 'desktop' ? 'composant-header' : 'composant-m-header',
          viewport === 'desktop'
            ? 'lib-client-header-desktop > div'
            : 'lib-client-header-mobile > div',
        );
        await componentShot(
          page,
          viewport,
          viewport === 'desktop' ? 'composant-footer' : 'composant-m-pied',
          viewport === 'desktop'
            ? 'lib-client-footer-desktop > footer'
            : 'lib-client-footer-mobile > footer',
        );
      }
      if (route === '/categories' && viewport === 'mobile')
        await componentShot(
          page,
          viewport,
          'composant-m-tabbar',
          'tpx-client-categories nav[aria-label="Navigation principale"]',
        );
      await check(viewport + route + ': no horizontal overflow', async () => {
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        assert.ok(overflow < 2, 'Overflow: ' + overflow);
      });
      if (route === '/')
        await check(viewport + ': requested home refinements', async () => {
          assert.equal(await page.locator('select:visible').count(), 0);
          assert.equal(
            await visible(
              page.getByText('Le prix le plus bas relevé à Kinshasa', {
                exact: true,
              }),
            ).count(),
            0,
          );
          assert.equal(
            await visible(
              page.getByText(
                'Comparé au prix le plus bas de la semaine dernière',
                { exact: true },
              ),
            ).count(),
            0,
          );
          assert.equal(
            await page
              .locator('footer')
              .getByText('Retour en haut', { exact: true })
              .count(),
            0,
          );
          const newsletter = visible(
            page.locator('input[type="email"]'),
          ).first();
          assert.ok((await newsletter.boundingBox()).height <= 41);
          const titles = await page
            .locator('.client-product-title:visible')
            .evaluateAll((elements) =>
              elements.map((e) => ({
                whiteSpace: getComputedStyle(e).whiteSpace,
                overflow: getComputedStyle(e).textOverflow,
              })),
            );
          assert.ok(
            titles.length > 0 &&
              titles.every(
                (t) => t.whiteSpace === 'nowrap' && t.overflow === 'ellipsis',
              ),
          );
          if (viewport === 'desktop') {
            assert.equal(
              await visible(
                page.getByRole('button', { name: 'Français', exact: true }),
              ).count(),
              0,
            );
            assert.equal(
              await visible(
                page.getByRole('button', {
                  name: 'Créer un compte',
                  exact: true,
                }),
              ).count(),
              0,
            );
            assert.ok(
              parseFloat(
                await visible(page.getByRole('searchbox')).evaluate(
                  (e) => getComputedStyle(e).fontSize,
                ),
              ) <= 13,
            );
            const trigger = page.getByRole('button', {
              name: 'Catégorie',
              exact: true,
            });
            await trigger.click();
            await page
              .getByRole('listbox', { name: 'Catégorie', exact: true })
              .waitFor();
            await shot(page, viewport, 'header-menu-categories', false);
            await page
              .getByRole('option', { name: 'Ordinateurs', exact: true })
              .click();
            await page.waitForFunction(
              () =>
                !document.querySelector(
                  '[role="listbox"][aria-label="Catégorie"]',
                ),
            );
            await trigger.click();
            await page.keyboard.press('Escape');
            await page.waitForFunction(
              () =>
                !document.querySelector(
                  '[role="listbox"][aria-label="Catégorie"]',
                ),
            );
          }
          await page.mouse.wheel(0, 850);
          await page.waitForFunction(() => window.scrollY > 400);
          const header = await page
            .locator(
              viewport === 'desktop'
                ? 'lib-client-header-desktop > div'
                : 'lib-client-header-mobile > div',
            )
            .boundingBox();
          assert.ok(
            Math.abs(header.y) < 2,
            'Header must remain at the viewport top',
          );
          await visible(
            page.getByRole('button', { name: 'Retour en haut', exact: true }),
          ).waitFor();
          await shot(page, viewport, 'accueil-navigation-fixe', false);
          await visible(
            page.getByRole('button', { name: 'Retour en haut', exact: true }),
          ).click();
          await page.waitForFunction(() => window.scrollY < 2);
        });
      if (route === '/panier') {
        await check(viewport + ': cart optimization', async () => {
          await visible(
            page.getByText('Optimiser mes achats', { exact: true }),
          ).click();
          await visible(page.getByText('Achats optimisés', { exact: false }))
            .first()
            .waitFor();
          await shot(
            page,
            viewport,
            viewport === 'desktop'
              ? '07b-panier-optimise'
              : 'm07b-panier-optimise',
          );
          assert.ok(
            (await page.locator('body').innerText()).includes('1\u202f063') ||
              (await page.locator('body').innerText()).includes('1 063'),
          );
          await visible(
            page.getByRole('radio', {
              name:
                viewport === 'desktop'
                  ? 'Le moins de trajets'
                  : 'Moins de trajets',
              exact: true,
            }),
          ).click();
          await page.waitForFunction(
            () =>
              [
                ...document.querySelectorAll('tpx-client-cart-group > section'),
              ].filter((e) => e.getClientRects().length).length === 1,
          );
          assert.equal(
            await page
              .locator('tpx-client-cart-group > section:visible')
              .count(),
            1,
          );
          assert.ok(
            /1[\s\u202f]090/.test(await page.locator('body').innerText()),
          );
          await visible(
            page.getByRole('button', {
              name: 'Retirer Samsung Galaxy S24 128 Go',
              exact: true,
            }),
          ).click();
          await page.waitForFunction(
            () =>
              ![...document.querySelectorAll('tpx-client-cart-group > section')]
                .filter((e) => e.getClientRects().length)
                .some((e) => e.textContent.includes('Samsung Galaxy S24')),
          );
          assert.ok(
            (await page.locator('body').innerText()).includes('401 USD'),
          );
        });
      }
      if (route.startsWith('/resultats')) {
        await check(viewport + ': price filters and empty state', async () => {
          if (viewport === 'mobile')
            await visible(page.getByText('Filtres', { exact: true })).click();
          const minimum = visible(
            page.locator(
              'input[placeholder="Min"], input[placeholder="Minimum"], #mmin',
            ),
          ).first();
          await minimum.fill('1000');
          if (viewport === 'mobile')
            await visible(page.getByText(/Afficher \d+ offres/)).click();
          await visible(
            page.getByRole('status').filter({ hasText: 'Aucun produit' }),
          )
            .first()
            .waitFor();
          assert.equal(
            await page.locator('tpx-client-results [hidden]:visible').count(),
            0,
          );
        });
      }
      if (route === '/boutiques') {
        await check(viewport + ': synchronized shop selection', async () => {
          const control = visible(
            page.getByRole('button', { name: 'UAC – Commerce', exact: true }),
          );
          await control.click();
          await page.waitForFunction(() =>
            [...document.querySelectorAll('button[aria-pressed="true"]')].some(
              (e) => e.textContent.includes('UAC – Commerce'),
            ),
          );
          assert.equal(await control.getAttribute('aria-pressed'), 'true');
          if (viewport === 'desktop')
            assert.ok(
              (
                await page
                  .getByRole('dialog', { name: 'Boutique sélectionnée' })
                  .innerText()
              ).includes('UAC – Commerce'),
            );
        });
      }
      if (route === '/compte')
        await check(viewport + ': account alternate panels', async () => {
          await visible(
            viewport === 'desktop'
              ? page.getByRole('button', { name: /Notifications/ })
              : page.getByRole('tab', { name: /Alertes/ }),
          ).click();
          await visible(
            page.getByRole('heading', { name: 'Mes alertes', exact: true }),
          ).waitFor();
          await visible(
            page.getByRole('button', { name: 'Désactiver', exact: true }),
          )
            .first()
            .click();
          await page.waitForFunction(
            () =>
              [
                ...document.querySelectorAll(
                  'tpx-client-account-panels button',
                ),
              ].filter(
                (e) =>
                  e.getClientRects().length &&
                  e.textContent.trim() === 'Désactiver',
              ).length === 1,
          );
          assert.equal(
            await page
              .locator('tpx-client-account-panels:visible')
              .getByRole('button', { name: 'Désactiver', exact: true })
              .count(),
            1,
          );
        });
      if (route === '/commercants')
        await check(viewport + ': merchant phone validation', async () => {
          await visible(page.locator('input[type="tel"]')).fill('12');
          await visible(
            page.getByRole('button', {
              name: 'Envoyer ma demande',
              exact: true,
            }),
          ).click();
          await visible(page.getByRole('alert')).waitFor();
        });
      await context.close();
    }
    const { page, context } = await pageFor(viewport);
    await ready(page, '/');
    await check(viewport + ': auth review header and footer', async () => {
      if (viewport === 'desktop') {
        const badges = page.locator(
          'lib-client-footer-desktop img[alt*="Store"], lib-client-footer-desktop img[alt*="Google Play"]',
        );
        assert.equal(await badges.count(), 2);
        for (const badge of await badges.all())
          assert.equal((await badge.boundingBox()).height, 48);
      } else {
        const header = page.locator('lib-client-header-mobile');
        assert.equal(
          await header
            .getByRole('button', { name: 'Se connecter', exact: true })
            .count(),
          0,
        );
        const favorites = await header
          .getByRole('link', { name: 'Compte et favoris', exact: true })
          .boundingBox();
        const cart = await header
          .getByRole('link', { name: 'Panier, 3 produits', exact: true })
          .boundingBox();
        const menu = await header
          .getByRole('button', { name: 'Menu', exact: true })
          .boundingBox();
        assert.ok(cart.x - (favorites.x + favorites.width) <= 1);
        assert.ok(menu.x - (cart.x + cart.width) <= 1);
        const currency = header.getByRole('group', {
          name: 'Devise',
          exact: true,
        });
        assert.ok((await currency.boundingBox()).height <= 29);
        assert.ok(
          parseFloat(
            await currency.evaluate((e) => getComputedStyle(e).borderRadius),
          ) >= 100,
        );
        for (const button of await currency.getByRole('button').all())
          assert.equal((await button.boundingBox()).height, 24);
      }
    });
    await check(viewport + ': shared currency conversion', async () => {
      await visible(
        page.getByRole('button', { name: 'CDF', exact: true }),
      ).click();
      await visible(page.getByText('1\u202f381\u202f650 FC', { exact: true }))
        .first()
        .waitFor();
      await visible(
        page.getByRole('button', { name: 'USD', exact: true }),
      ).click();
    });
    await check(viewport + ': authentication email/code/escape', async () => {
      if (viewport === 'mobile') {
        await visible(
          page.getByRole('button', { name: 'Menu', exact: true }),
        ).click();
        await shot(page, viewport, 'm12-menu', false);
        await visible(page.getByText('Se connecter', { exact: true })).click();
      } else
        await visible(
          page.getByRole('button', { name: 'Se connecter', exact: true }),
        )
          .first()
          .click();
      await shot(
        page,
        viewport,
        viewport === 'desktop'
          ? '01b-accueil-popup-connexion'
          : 'm11-connexion',
        false,
      );
      if (viewport === 'desktop') {
        const heading = visible(
          page.getByRole('heading', { name: 'Bon retour', exact: true }),
        );
        assert.equal(
          await heading.evaluate((e) => getComputedStyle(e).fontSize),
          '38px',
        );
        assert.equal(
          (
            await visible(
              page.getByRole('button', {
                name: 'Recevoir le code',
                exact: true,
              }),
            ).boundingBox()
          ).height,
          48,
        );
        assert.equal(
          (
            await visible(
              page.getByRole('button', {
                name: 'Continuer avec Google',
                exact: true,
              }),
            ).boundingBox()
          ).height,
          48,
        );
        await shot(page, viewport, '11-connexion-popup', false);
      }
      await visible(
        page.getByRole('textbox', { name: 'Adresse e-mail', exact: true }),
      )
        .last()
        .fill('test@example.com');
      await visible(
        page.getByRole('button', { name: 'Recevoir le code', exact: true }),
      ).click();
      await visible(
        page.getByRole('textbox', { name: 'Chiffre 1 du code', exact: true }),
      ).waitFor();
      assert.equal(
        await visible(
          page.getByRole('textbox', { name: /Chiffre \d du code/ }),
        ).count(),
        6,
      );
      await shot(
        page,
        viewport,
        viewport === 'desktop'
          ? '01c-accueil-popup-code'
          : 'm11b-connexion-code',
        false,
      );
      if (viewport === 'desktop') {
        await visible(
          page.getByText('test@example.com', { exact: true }),
        ).waitFor();
        assert.equal(
          await visible(
            page.getByRole('heading', { name: 'Entrez le code', exact: true }),
          ).evaluate((e) => getComputedStyle(e).fontSize),
          '38px',
        );
        for (const input of await visible(
          page.getByRole('textbox', { name: /Chiffre \d du code/ }),
        ).all()) {
          const box = await input.boundingBox();
          assert.equal(box.width, 48);
          assert.equal(box.height, 54);
        }
        const back = visible(
          page.getByRole('button', { name: "Modifier l'adresse", exact: true }),
        );
        assert.equal(await back.locator('svg').count(), 1);
        await back.click();
        await visible(
          page.getByRole('heading', { name: 'Bon retour', exact: true }),
        ).waitFor();
        assert.equal(
          await visible(
            page.getByRole('textbox', { name: 'Adresse e-mail', exact: true }),
          )
            .last()
            .inputValue(),
          'test@example.com',
        );
      }
      await page.keyboard.press('Escape');
      await page.waitForFunction(() =>
        [
          ...document.querySelectorAll('[aria-label="Connexion à Talaprix"]'),
        ].every((e) => !e.getClientRects().length),
      );
      assert.equal(
        await page
          .locator('[aria-label="Connexion à Talaprix"]:visible')
          .count(),
        0,
      );
    });
    if (viewport === 'desktop') {
      await check('desktop: search suggestions', async () => {
        await visible(page.getByRole('searchbox')).fill('hp pro');
        await visible(
          page.getByRole('listbox', { name: 'Suggestions' }),
        ).waitFor();
        const panel = await visible(
          page.getByRole('listbox', { name: 'Suggestions' }),
        ).boundingBox();
        const field = await visible(page.getByRole('searchbox')).boundingBox();
        assert.ok(
          panel.x > 250 && panel.width < 850 && panel.y > field.y,
          'Suggestions must remain anchored to search',
        );
        await visible(page.getByRole('searchbox')).press('ArrowDown');
        await page.waitForFunction(
          () => document.activeElement?.getAttribute('role') === 'option',
        );
        await shot(page, viewport, '02-recherche-ouverte');
        await page.keyboard.press('Escape');
      });
    } else {
      await ready(page, '/recherche');
      await shot(page, viewport, 'm02-recherche-ouverte');
      await ready(page, '/resultats?q=hp');
      await check('mobile: filters sheet', async () => {
        await visible(page.getByText('Filtres', { exact: true })).click();
        await shot(page, viewport, 'm03b-filtres', false);
      });
    }
    await context.close();
  }
} finally {
  await browser.close();
  fs.writeFileSync(
    path.join(output, 'report.json'),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      screenshots: report.screenshots.length,
      passed: report.checks.filter((c) => c.passed).length,
      failed: report.checks.filter((c) => !c.passed).length,
      pageErrors: report.pageErrors.length,
      apiRequests: report.forbiddenRequests.length,
      report: path.join(output, 'report.json'),
    }),
  );
}
if (
  report.checks.some((c) => !c.passed) ||
  report.pageErrors.length ||
  report.forbiddenRequests.length
)
  process.exitCode = 1;
