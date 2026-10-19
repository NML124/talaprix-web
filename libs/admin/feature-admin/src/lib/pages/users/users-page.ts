import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucidePause,
  LucidePencil,
  LucidePlay,
  LucideTrash2,
} from '@lucide/angular';
import { AdminMockApi } from '../../services/admin-mock-api';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { StatusDot } from '../../ui/status-dot';
import { EmptyState } from '../../ui/empty-state';
import { Pagination } from '../../ui/pagination';
import type { User } from '../../mocks/models';
import { UserDialog } from './user-dialog';

@Component({
  selector: 'tp-users-page',
  imports: [
    FormsModule,
    PageHeader,
    SegmentedTabs,
    StatusDot,
    EmptyState,
    Pagination,
    LucidePencil,
    LucidePause,
    LucidePlay,
    LucideTrash2,
    UserDialog,
  ],
  templateUrl: './users-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage {
  private readonly api = inject(AdminMockApi);
  protected readonly users = signal<User[]>([]);
  protected readonly selected = signal<User | null>(null);
  protected readonly dialogMode = signal<'edit' | 'suspend' | 'delete'>('edit');
  protected readonly tab = signal('Tous 12 680');
  protected readonly tabs = ['Tous 12 680', 'Actifs 12 542', 'Suspendus 138'];
  protected readonly query = signal('');
  protected readonly commune = signal('Toutes les communes');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly toast = signal('');
  protected readonly reason = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly communes = [
    'Toutes les communes',
    'Gombe',
    'Limete',
    'Kasa-Vubu',
    'Ngaliema',
    'Lingwala',
    'Bandalungwa',
    'Matete',
  ];
  protected readonly filtered = computed(() =>
    this.users().filter(
      (row) =>
        (this.tab().startsWith('Tous') ||
          row.status ===
            (this.tab().startsWith('Actifs') ? 'Actif' : 'Suspendu')) &&
        `${row.name} ${row.phone}`
          .toLowerCase()
          .includes(this.query().toLowerCase()) &&
        (this.commune() === 'Toutes les communes' ||
          row.commune === this.commune()),
    ),
  );
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
    ),
  );
  protected readonly visible = computed(() =>
    this.filtered().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  constructor() {
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.users.set(await this.api.listUsers());
    } catch {
      this.error.set('Les utilisateurs sont indisponibles.');
    } finally {
      this.loading.set(false);
    }
  }
  protected select(row: User, mode: 'edit' | 'suspend' | 'delete'): void {
    this.selected.set(structuredClone(row));
    this.dialogMode.set(mode);
    this.reason.set('');
    this.error.set('');
  }
  protected async saveProfile(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    if (!row.name.trim()) {
      this.error.set('Le nom est obligatoire.');
      return;
    }
    try {
      await this.api.updateUserProfile(row);
      this.users.set(await this.api.listUsers());
      this.selected.set(null);
      this.toast.set('Profil enregistré dans la maquette.');
    } catch {
      this.error.set('Modification impossible.');
    }
  }
  protected async toggleStatus(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    const updated = {
      ...row,
      status: row.status === 'Actif' ? 'Suspendu' : 'Actif',
    } as User;
    try {
      await this.api.saveUser(updated, this.reason());
      this.users.set(await this.api.listUsers());
      this.toast.set(
        `Compte ${updated.status === 'Actif' ? 'réactivé' : 'suspendu'} ; action inscrite au journal d’audit.`,
      );
      this.selected.set(null);
      this.reason.set('');
      this.error.set('');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Action impossible.',
      );
    }
  }
  protected async remove(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    try {
      await this.api.deleteUser(row.id);
      this.users.set(await this.api.listUsers());
      this.selected.set(null);
      this.toast.set('Compte supprimé de la maquette.');
    } catch {
      this.error.set('Suppression impossible.');
    }
  }
}
