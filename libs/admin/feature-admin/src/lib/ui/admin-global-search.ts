import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LucideSearch, LucideX } from '@lucide/angular';
import { products, shops } from '../mocks/catalogue';
import { CategoryPreviewStore } from '../services/category-preview-store';
import { AdminNotificationPreview } from '../services/admin-notification-preview';

interface SearchResult {
  group: string;
  label: string;
  detail: string;
  path: string;
  query?: Record<string, string>;
}
const modules: SearchResult[] = [
  {
    group: 'Modules',
    label: 'Vue d’ensemble',
    detail: 'Indicateurs',
    path: '/admin',
  },
  {
    group: 'Modules',
    label: 'Produits',
    detail: 'Catalogue',
    path: '/admin/catalogue',
  },
  {
    group: 'Modules',
    label: 'Catégories',
    detail: 'Organisation',
    path: '/admin/categories',
  },
  {
    group: 'Modules',
    label: 'Boutiques',
    detail: 'Partenaires',
    path: '/admin/boutiques',
  },
  {
    group: 'Modules',
    label: 'Scraping',
    detail: 'Revue',
    path: '/admin/scraping',
  },
  {
    group: 'Modules',
    label: 'Journal d’audit',
    detail: 'Équipe',
    path: '/admin/equipe',
    query: { tab: 'audit' },
  },
];
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr');

@Component({
  selector: 'tp-admin-global-search',
  host: {
    class: 'block min-w-0 flex-[0_1_480px] max-[820px]:flex-[1_1_220px]',
  },
  imports: [LucideSearch, LucideX],
  templateUrl: './admin-global-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGlobalSearch {
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly categories = inject(CategoryPreviewStore);
  private readonly notices = inject(AdminNotificationPreview);
  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly results = computed(() => {
    const term = normalize(this.query().trim());
    if (!term) return [];
    const all: SearchResult[] = [
      ...modules,
      ...products.map((row) => ({
        group: 'Produits',
        label: row.name,
        detail: `${row.category} · ${row.unit}`,
        path: '/admin/catalogue',
        query: { q: row.name },
      })),
      ...shops.map((row) => ({
        group: 'Boutiques',
        label: row.name,
        detail: row.commune,
        path: '/admin/boutiques',
        query: { q: row.name },
      })),
      ...this.categories.categories().map((row) => ({
        group: 'Catégories',
        label: row.name,
        detail: row.description,
        path: '/admin/categories',
        query: { q: row.name },
      })),
      ...this.notices.pendingShopRequests().map((row) => ({
        group: 'Demandes boutiques',
        label: row.shop ?? row.title,
        detail: 'À examiner',
        path: '/admin/notifications',
        query: { request: String(row.id) },
      })),
    ];
    const counts = new Map<string, number>();
    return all.filter((row) => {
      if (!normalize(`${row.label} ${row.detail}`).includes(term)) return false;
      const count = counts.get(row.group) ?? 0;
      counts.set(row.group, count + 1);
      return count < 3;
    });
  });
  protected readonly groups = computed(() => [
    ...new Set(this.results().map((row) => row.group)),
  ]);
  protected groupResults(group: string): SearchResult[] {
    return this.results().filter((row) => row.group === group);
  }
  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.open.set(true);
  }
  protected onOutside(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node))
      this.open.set(false);
  }
  protected onEnter(): void {
    const first = this.results()[0];
    if (first) this.navigate(first);
  }
  protected navigate(row: SearchResult): void {
    this.open.set(false);
    this.query.set('');
    void this.router.navigate([row.path], { queryParams: row.query ?? null });
  }
}
