export const SEO_ORIGIN = 'https://talaprix.com';
export const SEO_IMAGE = `${SEO_ORIGIN}/client-design/assets/logo-talaprix.png`;
export const SEO_PAGES: Readonly<
  Record<string, { title: string; description: string }>
> = {
  '/': {
    title: 'TalaPrix : comparez les prix des boutiques de Kinshasa',
    description:
      'Comparez les prix des produits dans les boutiques de Kinshasa, trouvez une offre près de chez vous et contactez le vendeur avant de vous déplacer.',
  },
  '/resultats': {
    title: 'Produits et prix des boutiques de Kinshasa | TalaPrix',
    description:
      'Parcourez les produits proposés par les boutiques de Kinshasa. Comparez les prix, les variantes et les vendeurs sur TalaPrix.',
  },
  '/categories': {
    title: 'Catégories de produits à Kinshasa | TalaPrix',
    description:
      'Explorez les catégories TalaPrix et comparez les produits disponibles auprès des boutiques de Kinshasa.',
  },
  '/boutiques': {
    title: 'Boutiques et vendeurs à Kinshasa | TalaPrix',
    description:
      'Découvrez les boutiques présentes sur TalaPrix, consultez leurs produits et comparez les offres avant de vous déplacer à Kinshasa.',
  },
  '/commercants': {
    title: 'Inscrire ma boutique sur TalaPrix',
    description:
      'Présentez votre boutique et vos offres aux utilisateurs de TalaPrix. Découvrez comment rejoindre le comparateur de prix à Kinshasa.',
  },
  '/contact': {
    title: 'Contacter TalaPrix',
    description:
      'Contactez l’équipe TalaPrix pour une question sur le catalogue, votre boutique ou l’utilisation du comparateur.',
  },
  '/aide': {
    title: 'Aide et questions fréquentes | TalaPrix',
    description:
      'Découvrez comment comparer les prix, trouver une boutique et utiliser TalaPrix.',
  },
  '/conditions-utilisation': {
    title: 'Conditions d’utilisation | TalaPrix',
    description:
      'Consultez les conditions d’utilisation de TalaPrix et les règles applicables au service de comparaison.',
  },
  '/conditions-consommateur': {
    title: 'Conditions consommateur | TalaPrix',
    description:
      'Informez-vous sur les conditions applicables aux consommateurs utilisant TalaPrix.',
  },
  '/politique-utilisation': {
    title: 'Politique d’utilisation | TalaPrix',
    description:
      'Consultez la politique d’utilisation de TalaPrix et les règles de publication sur la plateforme.',
  },
  '/confidentialite': {
    title: 'Confidentialité et données personnelles | TalaPrix',
    description:
      'Découvrez comment TalaPrix traite les données personnelles et les choix de confidentialité à votre disposition.',
  },
  '/suppression-donnees': {
    title: 'Suppression des données | TalaPrix',
    description:
      'Consultez la procédure de suppression de vos données personnelles et de votre compte TalaPrix.',
  },
};

export const SEO_PRIVATE_PAGES: Readonly<
  Record<string, { title: string; description: string }>
> = {
  '/panier': {
    title: 'Mon panier | TalaPrix',
    description:
      'Consultez les produits et les offres que vous avez sélectionnés sur TalaPrix.',
  },
  '/favoris': {
    title: 'Mes favoris | TalaPrix',
    description: 'Retrouvez vos produits favoris sur TalaPrix.',
  },
  '/recherche': {
    title: 'Rechercher un produit | TalaPrix',
    description: 'Recherchez un produit ou une boutique sur TalaPrix.',
  },
  '/boutiques/sans-position': {
    title: 'Boutiques sans position disponible | TalaPrix',
    description:
      'Consultez les boutiques dont la position n’est pas encore disponible.',
  },
};

export interface SeoPolicy {
  readonly path: string;
  readonly canonical: string;
  readonly index: boolean;
  readonly page: number;
}
const tracking = /^(utm_.+|gclid|dclid|fbclid|msclkid)$/i;
export const SEO_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Canonicals never inherit an untrusted request Host, tracking token or search text. */
export function seoPolicy(raw: string): SeoPolicy {
  const parsed = new URL(raw, SEO_ORIGIN);
  const path = parsed.pathname.replace(/\/+$/, '') || '/';
  const canonical = new URL(path, SEO_ORIGIN);
  const product = /^\/produit\/([^/]+)$/.exec(path);
  let index =
    Boolean(SEO_PAGES[path]) || Boolean(product && SEO_UUID.test(product[1]));
  let page = 1;
  for (const [key, value] of parsed.searchParams) {
    if (tracking.test(key)) continue;
    if (
      path === '/resultats' &&
      key === 'category_id' &&
      SEO_UUID.test(value) &&
      parsed.searchParams.getAll(key).length === 1
    ) {
      canonical.searchParams.set(key, value);
    } else if (
      path === '/resultats' &&
      key === 'page' &&
      /^\d+$/.test(value) &&
      Number(value) >= 1 &&
      Number(value) <= 10000 &&
      parsed.searchParams.getAll(key).length === 1
    ) {
      page = Number(value);
      if (page > 1) canonical.searchParams.set('page', String(page));
    } else if (
      path === '/resultats' &&
      key === 'sort' &&
      value === 'name_asc'
    ) {
      // The default sort represents the same page.
    } else index = false;
  }
  canonical.searchParams.sort();
  return { path, canonical: canonical.href, index, page };
}

export function paginationUrl(raw: string, page: number): string {
  const url = new URL(raw, SEO_ORIGIN);
  if (page <= 1) url.searchParams.delete('page');
  else url.searchParams.set('page', String(page));
  url.hash = '';
  return url.pathname + url.search;
}

export function seoImage(source: string | null | undefined): string {
  try {
    const url = new URL(source || SEO_IMAGE, SEO_ORIGIN);
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : SEO_IMAGE;
  } catch {
    return SEO_IMAGE;
  }
}
