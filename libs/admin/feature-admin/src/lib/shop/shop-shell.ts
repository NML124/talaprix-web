import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideBarChart3,
  LucideChevronRight,
  LucideBadgePercent,
  LucideLayoutDashboard,
  LucideMegaphone,
  LucideMenu,
  LucideMessageCircle,
  LucideMoon,
  LucidePackage,
  LucideSettings2,
  LucideX,
  LucideLogOut,
} from '@lucide/angular';
import { ShopStore } from './shop-store';
import { AuthSessionStore } from '@talaprix/users/data-access';
import { Router } from '@angular/router';
import { AdminSelect } from '../ui/admin-select';
import { AdminDialog } from '../ui/admin-dialog';

@Component({
  selector: 'tp-shop-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LucideBarChart3,
    LucideChevronRight,
    LucideBadgePercent,
    LucideLayoutDashboard,
    LucideMegaphone,
    LucideMenu,
    LucideMessageCircle,
    LucideMoon,
    LucidePackage,
    LucideSettings2,
    LucideX,
    LucideLogOut,
    AdminSelect,
    AdminDialog,
  ],
  providers: [ShopStore],
  templateUrl: './shop-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopShell {
  protected readonly store = inject(ShopStore);
  protected readonly session = inject(AuthSessionStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly logoutConfirmation = signal(false);
  protected readonly theme = signal<'system' | 'light' | 'dark'>('system');
  protected readonly themeLabel = computed(
    () => ({ system: 'Système', light: 'Clair', dark: 'Sombre' })[this.theme()],
  );
  private readonly systemDark = signal(false);
  protected readonly resolvedTheme = computed(() =>
    this.theme() === 'system'
      ? this.systemDark()
        ? 'dark'
        : 'light'
      : this.theme(),
  );
  protected readonly links = [
    { label: 'Vue d’ensemble', path: '/shop', icon: 'home' },
    { label: 'Offres', path: '/shop/offres', icon: 'offer' },
    { label: 'Promotions', path: '/shop/promotions', icon: 'discount' },
    { label: 'Mises en avant', path: '/shop/visibilite', icon: 'visibility' },
    { label: 'Analyses', path: '/shop/analyses', icon: 'analytics' },
    { label: 'Avis', path: '/shop/avis', icon: 'reviews' },
    { label: 'Profil', path: '/shop/profil', icon: 'settings' },
  ] as const;

  constructor() {
    void this.store.load();
    afterNextRender(() => {
      const saved = localStorage.getItem('talaprix-admin-theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system')
        this.theme.set(saved);
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(media.matches);
      const onSystemThemeChange = (event: MediaQueryListEvent) =>
        this.systemDark.set(event.matches);
      media.addEventListener('change', onSystemThemeChange);
      this.destroyRef.onDestroy(() =>
        media.removeEventListener('change', onSystemThemeChange),
      );
    });
  }

  protected setTheme(value: string): void {
    value =
      (
        { Système: 'system', Clair: 'light', Sombre: 'dark' } as Record<
          string,
          string
        >
      )[value] ?? value;
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    this.theme.set(value);
    try {
      localStorage.setItem('talaprix-admin-theme', value);
    } catch {
      // The preference stays usable for this session.
    }
  }

  protected logout(): void {
    this.logoutConfirmation.set(true);
  }
  protected async confirmLogout(): Promise<void> {
    this.logoutConfirmation.set(false);
    await this.session.signOut();
    await this.router.navigate(['/auth']);
  }
}
