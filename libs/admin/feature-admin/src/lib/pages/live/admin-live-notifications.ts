import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
import {
  LucideCheck,
  LucideMail,
  LucideMapPin,
  LucideTrash2,
} from '@lucide/angular';
import {
  AdminNotificationStore,
  type AdminNotification,
  type AdminNotificationFilter,
} from '../../services/admin-notification-store';
import { AdminDialog } from '../../ui/admin-dialog';
import { PageHeader } from '../../ui/page-header';
import { AdminLivePagination } from './admin-live-pagination';

@Component({
  selector: 'tp-admin-live-notifications',
  host: {
    class:
      'tp-admin tp-page tp-admin-notifications grid min-w-0 content-start gap-5',
  },
  imports: [
    DatePipe,
    PageHeader,
    AdminDialog,
    AdminLivePagination,
    LucideCheck,
    LucideMail,
    LucideMapPin,
    LucideTrash2,
  ],
  templateUrl: './admin-live-notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveNotifications {
  readonly #functions = inject(SupabaseFunctions);
  protected readonly inbox = inject(AdminNotificationStore);
  protected readonly pendingDelete = signal<AdminNotification | null>(null);
  protected readonly shopRequest = signal<AdminNotification | null>(null);
  protected readonly noticeDetail = signal<AdminNotification | null>(null);
  protected readonly rejectingRequest = signal(false);
  protected readonly rejectionReason = signal('');
  protected readonly requestBusy = signal(false);
  protected readonly requestError = signal('');
  protected readonly requestNotice = signal('');

  constructor() {
    void this.inbox.load(1);
  }

  protected setFilter(filter: AdminNotificationFilter): void {
    if (filter !== this.inbox.filter()) void this.inbox.load(1, filter);
  }

  protected async openNotice(notice: AdminNotification): Promise<void> {
    const data = notice.data ?? {};
    if (this.text(data, 'user_id') && this.text(data, 'shop_name')) {
      this.requestError.set('');
      this.requestNotice.set('');
      this.rejectionReason.set('');
      this.rejectingRequest.set(false);
      this.shopRequest.set(notice);
    } else this.noticeDetail.set(notice);
    if (!notice.is_read && this.inbox.supportsReadActions()) {
      try {
        await this.inbox.updateState(notice.notification_id, 'read');
      } catch {
        // Keep the detail reachable even if its read marker could not be saved.
      }
    }
  }

  protected text(data: Readonly<Record<string, unknown>>, key: string): string {
    const value = data[key];
    return typeof value === 'string' ? value.trim() : '';
  }

  protected coordinate(key: 'lat' | 'lon'): number | null {
    const value = this.shopRequest()?.data?.[key];
    if (value === null || value === undefined || value === '') return null;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  protected shopValue(key: string): string {
    const data = this.shopRequest()?.data;
    return data ? this.text(data, key) : '';
  }

  protected shopCategories(): readonly string[] {
    const categories = this.shopRequest()?.data?.['categories'];
    return Array.isArray(categories)
      ? categories.filter((value): value is string => typeof value === 'string')
      : [];
  }

  protected detailRows(
    notice: AdminNotification,
  ): readonly { key: string; value: string }[] {
    return Object.entries(notice.data ?? {}).map(([key, value]) => ({
      key,
      value:
        value === null || value === undefined
          ? '—'
          : typeof value === 'string'
            ? value
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value),
    }));
  }

  protected shopImage(): string {
    const value = this.shopValue('picture_url');
    return /^https:\/\//i.test(value) ? value : '';
  }

  protected locationUrl(): string | null {
    const lat = this.coordinate('lat');
    const lon = this.coordinate('lon');
    return lat === null || lon === null
      ? null
      : `https://maps.google.com/?q=${lat},${lon}`;
  }

  protected async acceptShopRequest(): Promise<void> {
    const notice = this.shopRequest();
    const data = notice?.data;
    const lat = this.coordinate('lat');
    const lon = this.coordinate('lon');
    if (
      !notice ||
      !data ||
      !this.text(data, 'user_id') ||
      !this.text(data, 'shop_name') ||
      lat === null ||
      lon === null
    ) {
      this.requestError.set(
        'Il manque le nom, l’identifiant ou les coordonnées nécessaires à la création de la boutique.',
      );
      return;
    }
    await this.runShopRequestAction(async () => {
      await this.#functions.post('promote-user-to-shop', {
        user_id: this.text(data, 'user_id'),
        shop_name: this.text(data, 'shop_name'),
        lat,
        lon,
        picture_url: this.text(data, 'picture_url') || null,
        address: this.text(data, 'address') || null,
        phone_number: this.text(data, 'phone_number') || null,
      });
      try {
        await this.inbox.updateState(notice.notification_id, 'delete');
      } catch {
        this.inbox.removeLocal(notice.notification_id);
        this.inbox.actionError.set('');
      }
      this.requestNotice.set('La boutique a été validée.');
      this.inbox.removeLocal(notice.notification_id);
      this.shopRequest.set(null);
    });
  }

  protected async rejectShopRequest(): Promise<void> {
    const notice = this.shopRequest();
    if (!notice) return;
    await this.runShopRequestAction(async () => {
      await this.#functions.post('reject-shop-request', {
        notification_id: notice.notification_id,
        reason: this.rejectionReason().trim() || undefined,
      });
      this.requestNotice.set('La demande de boutique a été refusée.');
      this.inbox.removeLocal(notice.notification_id);
      this.shopRequest.set(null);
    });
  }

  private async runShopRequestAction(
    action: () => Promise<void>,
  ): Promise<void> {
    this.requestBusy.set(true);
    this.requestError.set('');
    try {
      await action();
    } catch (error) {
      this.requestError.set(
        error instanceof Error ? error.message : 'La décision a échoué.',
      );
    } finally {
      this.requestBusy.set(false);
    }
  }

  protected async toggleRead(notice: AdminNotification): Promise<void> {
    try {
      await this.inbox.updateState(
        notice.notification_id,
        notice.is_read ? 'unread' : 'read',
      );
    } catch {
      // The store exposes the failure message in the page alert.
    }
  }

  protected async deleteNotice(): Promise<void> {
    const notice = this.pendingDelete();
    if (!notice) return;
    try {
      await this.inbox.updateState(notice.notification_id, 'delete');
      this.pendingDelete.set(null);
    } catch {
      // Keep the confirmation open so the user can retry or cancel.
    }
  }
}
