import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SupabaseClientService,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';
import { PageHeader } from '../../ui/page-header';

@Component({
  selector: 'tp-admin-live-profile',
  imports: [FormsModule, PageHeader],
  templateUrl: './admin-live-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveProfile {
  readonly #functions = inject(SupabaseFunctions);
  readonly #supabase = inject(SupabaseClientService);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly email = signal('');
  protected readonly role = signal('');
  #userId = '';
  #originalPhone = '';

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const identity = await this.#supabase.client?.auth.getUser();
      const userId = identity?.data.user?.id;
      if (!userId)
        throw new Error('Reconnectez-vous pour consulter votre profil.');
      this.#userId = userId;
      const response = await this.#functions.get<unknown>('admin-users', {
        user_id: userId,
      });
      if (!record(response) || !record(response['user']))
        throw new Error('Profil indisponible.');
      const user = response['user'];
      this.name.set(text(user['name']));
      this.phone.set(text(user['phone_number']));
      this.#originalPhone = this.phone();
      this.email.set(text(user['email']));
      this.role.set(record(user['role']) ? text(user['role']['title']) : '');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Profil indisponible.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (this.loading() || this.saving()) return;
    const name = this.name().trim();
    const phone = this.phone().trim();
    if (name.length < 2 || (phone !== this.#originalPhone && !phone)) {
      this.error.set('Vérifiez le nom et le numéro de téléphone.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      await this.#functions.put('admin-users', {
        user_id: this.#userId,
        name,
        ...(phone !== this.#originalPhone ? { phone_number: phone } : {}),
      });
      this.#originalPhone = phone;
      this.notice.set('Profil enregistré.');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Enregistrement impossible.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
