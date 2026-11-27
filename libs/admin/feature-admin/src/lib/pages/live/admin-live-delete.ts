import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import { AdminDialog } from '../../ui/admin-dialog';
import { deleteImpact, type DeleteImpact } from './admin-delete-impact';
import type { Resource, Row } from './admin-live-row';

@Component({
  selector: 'tp-admin-live-delete',
  imports: [AdminDialog, FormsModule],
  templateUrl: './admin-live-delete.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveDelete implements OnInit {
  readonly #api = inject(SupabaseFunctions);
  readonly resource = input.required<Resource>();
  readonly row = input.required<Row>();
  readonly closed = output<void>();
  readonly deleted = output<void>();
  readonly impact = signal<DeleteImpact | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly confirmed = signal(false);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.confirmed.set(false);
    this.impact.set(null);
    this.error.set('');
    this.loading.set(true);
    try {
      const impact = deleteImpact(
        await this.#api.post<unknown>('admin-catalogue-manage', {
          resource: this.resource(),
          id: this.row().id,
          action: 'delete_preview',
        }),
      );
      if (impact.id !== this.row().id || impact.resource !== this.resource())
        throw new Error('L’aperçu ne correspond pas à cet élément.');
      this.impact.set(impact);
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible de vérifier les éléments liés.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    const impact = this.impact();
    if (
      this.busy() ||
      this.loading() ||
      !this.confirmed() ||
      !impact?.can_delete
    )
      return;
    this.busy.set(true);
    this.error.set('');
    try {
      const response = await this.#api.post<{
        result?: { deleted?: boolean; already_deleted?: boolean };
      }>('admin-catalogue-manage', {
        resource: this.resource(),
        id: this.row().id,
        action: 'delete',
        plan_hash: impact.plan_hash,
        confirmed: true,
      });
      if (
        response.result?.deleted !== true &&
        response.result?.already_deleted !== true
      )
        throw new Error('La suppression n’a pas été confirmée par le serveur.');
      this.deleted.emit();
    } catch (error) {
      this.confirmed.set(false);
      this.impact.set(null);
      this.error.set(
        error instanceof Error ? error.message : 'Suppression impossible.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
