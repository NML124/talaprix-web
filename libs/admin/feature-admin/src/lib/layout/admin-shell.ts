import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  LucideBell,
  LucideChevronDown,
  LucideChevronRight,
  LucideChevronUp,
  LucideChevronsUpDown,
  LucideLayoutGrid,
  LucideMegaphone,
  LucideScanSearch,
  LucidePackage,
  LucideSearch,
  LucideMoon,
  LucideMenu,
  LucideShieldCheck,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { filter } from 'rxjs';

interface NavPage {
  label: string;
  path: string;
  count?: number;
  query?: string;
}
interface NavSection {
  label: string;
  icon: string;
  pages: NavPage[];
  count?: number;
}

@Component({
  selector: 'tp-admin-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    LucideBell,
    LucideChevronDown,
    LucideChevronRight,
    LucideChevronUp,
    LucideChevronsUpDown,
    LucideLayoutGrid,
    LucideMegaphone,
    LucideScanSearch,
    LucidePackage,
    LucideSearch,
    LucideMoon,
    LucideMenu,
    LucideShieldCheck,
    LucideUsers,
    LucideX,
  ],
  templateUrl: './admin-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  private readonly router = inject(Router);
  protected readonly currentPath = signal(this.router.url.split('?')[0]);
  protected readonly scrolled = signal(false);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly theme = signal<'system' | 'light' | 'dark'>('system');
  private readonly systemDark = signal(false);
  protected readonly resolvedTheme = computed(() =>
    this.theme() === 'system'
      ? this.systemDark()
        ? 'dark'
        : 'light'
      : this.theme(),
  );
  protected readonly currentQuery = signal(
    this.router.url.split('tab=')[1] ?? '',
  );
  protected readonly open = signal<string[]>(this.initialOpen());
  protected readonly sections: NavSection[] = [
    {
      label: 'Pilotage',
      icon: 'grid',
      pages: [
        { label: 'Vue d’ensemble', path: '/admin' },
        { label: 'Rapports', path: '/admin/rapports' },
      ],
    },
    {
      label: 'Découverte',
      icon: 'scraping',
      pages: [{ label: 'Scraping', path: '/admin/scraping' }],
    },
    {
      label: 'Catalogue & prix',
      icon: 'package',
      count: 24,
      pages: [
        { label: 'Produits', path: '/admin/catalogue' },
        { label: 'Prix & modération', path: '/admin/moderation', count: 24 },
        { label: 'Boutiques', path: '/admin/boutiques', count: 4 },
      ],
    },
    {
      label: 'Marketing',
      icon: 'megaphone',
      pages: [
        { label: 'Promotions', path: '/admin/marketing', query: 'promotions' },
        {
          label: 'Notifications',
          path: '/admin/marketing',
          query: 'notifications',
        },
        {
          label: 'Email & messages',
          path: '/admin/marketing',
          query: 'messages',
        },
      ],
    },
    {
      label: 'Communauté',
      icon: 'users',
      pages: [{ label: 'Utilisateurs', path: '/admin/utilisateurs' }],
    },
    {
      label: 'Équipe & accès',
      icon: 'shield',
      pages: [
        { label: 'Administrateurs', path: '/admin/equipe' },
        { label: 'Rôles & permissions', path: '/admin/roles' },
        { label: 'Mon profil & sécurité', path: '/admin/profil' },
      ],
    },
  ];

  constructor() {
    afterNextRender(() => {
      const saved = localStorage.getItem('talaprix-admin-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system')
        this.theme.set(saved);
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(media.matches);
      this.syncBrowserTheme();
      media.addEventListener('change', (event) => {
        this.systemDark.set(event.matches);
        if (this.theme() === 'system') this.syncBrowserTheme();
      });
    });
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        this.currentPath.set(event.urlAfterRedirects.split('?')[0]);
        this.mobileMenuOpen.set(false);
        this.currentQuery.set(event.urlAfterRedirects.split('tab=')[1] ?? '');
        const section = this.sections.find((group) =>
          group.pages.some((page) => page.path === this.currentPath()),
        );
        if (section && !this.open().includes(section.label))
          this.open.update((groups) => [...groups, section.label]);
      });
  }

  protected isOpen(label: string): boolean {
    return this.open().includes(label);
  }
  protected isActive(page: NavPage): boolean {
    return (
      this.currentPath() === page.path &&
      (!page.query || (this.currentQuery() || 'promotions') === page.query)
    );
  }
  protected toggle(label: string): void {
    this.open.update((groups) =>
      groups.includes(label)
        ? groups.filter((item) => item !== label)
        : [...groups, label],
    );
    try {
      localStorage.setItem('talaprix-admin-nav', JSON.stringify(this.open()));
    } catch {
      /* navigateur privé */
    }
  }
  protected onMainScroll(event: Event): void {
    this.scrolled.set((event.target as HTMLElement).scrollTop > 8);
  }
  protected onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
  protected setTheme(value: string): void {
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    this.theme.set(value);
    this.syncBrowserTheme();
    try {
      localStorage.setItem('talaprix-admin-theme', value);
    } catch {
      /* stockage indisponible */
    }
  }
  protected onThemeChange(event: Event): void {
    this.setTheme((event.target as HTMLSelectElement).value);
  }
  private syncBrowserTheme(): void {
    const color = this.resolvedTheme() === 'dark' ? '#111718' : '#f6f6f6';
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', color);
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }
  private initialOpen(): string[] {
    try {
      const stored = localStorage.getItem('talaprix-admin-nav');
      if (stored) {
        const value: unknown = JSON.parse(stored);
        if (
          Array.isArray(value) &&
          value.every((item) => typeof item === 'string')
        )
          return value;
      }
    } catch {
      /* premier affichage */
    }
    return ['Pilotage'];
  }
}
