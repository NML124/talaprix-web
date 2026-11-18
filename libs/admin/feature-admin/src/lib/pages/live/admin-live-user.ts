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
import { AdminDateCard } from '../../ui/admin-date-card';
import type { Row } from './admin-live-row';

interface InterviewerPerformance {
  readonly shops: number;
  readonly offers: number;
  readonly worked_days: number;
  readonly weekly: readonly {
    week_start: string;
    shops: number;
    offers: number;
    worked_days: number;
  }[];
}

@Component({
  selector: 'tp-admin-live-user',
  imports: [FormsModule, AdminDialog, AdminDateCard],
  templateUrl: './admin-live-user.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveUser implements OnInit {
  readonly row = input.required<Row>();
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly #functions = inject(SupabaseFunctions);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly name = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly role = signal('');
  readonly roleAction = signal<
    'promote_to_interviewer' | 'promote_to_shop' | 'demote_to_user' | null
  >(null);
  readonly performance = signal<InterviewerPerformance | null>(null);
  readonly performanceLoading = signal(false);
  readonly performanceError = signal('');
  readonly performanceFrom = signal(daysAgo(29));
  readonly performanceTo = signal(daysAgo(0));
  readonly shopName = signal('');
  readonly hasShop = signal(false);
  readonly shopAddress = signal('');
  readonly shopLat = signal('');
  readonly shopLon = signal('');
  #originalPhone = '';
  #originalShop = { name: '', lat: '', lon: '' };

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.#functions.get<unknown>('admin-users', {
        user_id: this.row().id,
      });
      if (!record(response) || !record(response['user']))
        throw new Error('Profil indisponible.');
      const user = response['user'];
      this.name.set(text(user['name']));
      this.phone.set(text(user['phone_number']));
      this.#originalPhone = this.phone();
      this.email.set(text(user['email']));
      this.role.set(record(user['role']) ? text(user['role']['title']) : '');
      const shop = record(response['shop']) ? response['shop'] : null;
      this.hasShop.set(shop !== null);
      this.shopName.set(shop ? text(shop['name']) : '');
      this.shopAddress.set(shop ? text(shop['address']) : '');
      this.shopLat.set(shop?.['lat'] == null ? '' : String(shop['lat']));
      this.shopLon.set(shop?.['lon'] == null ? '' : String(shop['lon']));
      this.#originalShop = {
        name: this.shopName(),
        lat: this.shopLat(),
        lon: this.shopLon(),
      };
      if (this.role() === 'interviewer') void this.loadPerformance();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Profil indisponible.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    if (this.loading() || this.saving()) return;
    const name = this.name().trim();
    if (name.length < 2) {
      this.error.set('Saisissez un nom d’au moins deux caractères.');
      return;
    }
    const phone = this.phone().trim();
    if (phone !== this.#originalPhone && !phone) {
      this.error.set('Le numéro ne peut pas être effacé depuis ce formulaire.');
      return;
    }
    const shopName = this.shopName().trim();
    const lat = this.shopLat().trim();
    const lon = this.shopLon().trim();
    const shopChanged =
      shopName !== this.#originalShop.name ||
      lat !== this.#originalShop.lat ||
      lon !== this.#originalShop.lon;
    if (
      shopChanged &&
      (!shopName ||
        !lat ||
        !lon ||
        !Number.isFinite(Number(lat)) ||
        !Number.isFinite(Number(lon)) ||
        Math.abs(Number(lat)) > 90 ||
        Math.abs(Number(lon)) > 180)
    ) {
      this.error.set('Vérifiez le nom et les coordonnées de la boutique.');
      return;
    }
    this.error.set('');
    this.saving.set(true);
    try {
      await this.#functions.put('admin-users', {
        user_id: this.row().id,
        name,
        ...(phone !== this.#originalPhone ? { phone_number: phone } : {}),
        ...(shopChanged
          ? {
              shop_name: shopName,
              shop_lat: Number(lat),
              shop_lon: Number(lon),
            }
          : {}),
      });
      this.saved.emit();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Mise à jour impossible.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  async changeRole(): Promise<void> {
    const action = this.roleAction();
    if (!action || this.saving()) return;
    this.error.set('');
    const shopName = this.shopName().trim();
    const lat = Number(this.shopLat());
    const lon = Number(this.shopLon());
    if (
      action === 'promote_to_shop' &&
      (!shopName ||
        !this.shopLat().trim() ||
        !this.shopLon().trim() ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180)
    ) {
      this.error.set('Renseignez le nom et les coordonnées de la boutique.');
      return;
    }
    this.saving.set(true);
    try {
      await this.#functions.put('admin-users', {
        user_id: this.row().id,
        [action]: true,
        ...(action === 'promote_to_shop'
          ? { shop_name: shopName, shop_lat: lat, shop_lon: lon }
          : {}),
      });
      this.saved.emit();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Changement de rôle impossible.',
      );
    } finally {
      this.saving.set(false);
      this.roleAction.set(null);
    }
  }

  async loadPerformance(): Promise<void> {
    this.performanceLoading.set(true);
    this.performanceError.set('');
    try {
      const result = await this.#functions.get<InterviewerPerformance>(
        'interviewer',
        {
          mode: 'performance',
          interviewer_id: this.row().id,
          from: this.performanceFrom(),
          to: this.performanceTo(),
        },
      );
      this.performance.set(result);
    } catch (error) {
      this.performanceError.set(
        error instanceof Error ? error.message : 'Rendus indisponibles.',
      );
    } finally {
      this.performanceLoading.set(false);
    }
  }
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
