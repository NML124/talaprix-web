import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { PageHeader } from '../../ui/page-header';

interface RoleCount {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}
const roles = [
  { id: 'admin', label: 'Administrateurs' },
  { id: 'interviewer', label: 'Enquêteurs' },
  { id: 'shop', label: 'Boutiques' },
  { id: 'user', label: 'Clients' },
] as const;

@Component({
  selector: 'tp-admin-live-roles',
  imports: [PageHeader, RouterLink],
  templateUrl: './admin-live-roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveRoles {
  readonly #functions = inject(SupabaseFunctions);
  protected readonly rows = signal<readonly RoleCount[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const counts = await Promise.all(
        roles.map(async (role) => {
          const response = await this.#functions.get<{ total: number }>(
            'admin-users',
            {
              role: role.id,
              page: '1',
              limit: '1',
            },
          );
          if (!Number.isFinite(response.total))
            throw new Error('Comptage indisponible.');
          return { ...role, count: response.total };
        }),
      );
      this.rows.set(counts);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Rôles indisponibles.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
