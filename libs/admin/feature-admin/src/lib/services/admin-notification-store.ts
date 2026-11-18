import { inject, Service, signal } from '@angular/core';
import {
  SupabaseClientService,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';

export interface AdminNotification {
  readonly notification_id: string;
  readonly title: string;
  readonly content: string;
  readonly created_at: string;
  readonly is_read: boolean;
  readonly data?: Readonly<Record<string, unknown>> | null;
}

export type AdminNotificationFilter = 'all' | 'unread' | 'read';
export type AdminNotificationAction = 'read' | 'unread' | 'delete';

interface NotificationResponse {
  readonly data: readonly AdminNotification[];
  readonly pagination: {
    readonly total_pages: number;
    readonly total_items?: number | null;
  };
  readonly schema_version: number;
}

@Service()
export class AdminNotificationStore {
  readonly #functions = inject(SupabaseFunctions);
  readonly #supabase = inject(SupabaseClientService);
  readonly rows = signal<readonly AdminNotification[]>([]);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly totalItems = signal(0);
  readonly filter = signal<AdminNotificationFilter>('all');
  readonly loading = signal(false);
  readonly actionBusy = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly supportsReadActions = signal(false);
  readonly unreadCount = signal<number | null>(null);

  async load(page = this.page(), filter = this.filter()): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await this.#functions.get<NotificationResponse>(
        'get-notifications',
        {
          page: String(page),
          limit: '30',
          filter,
        },
      );
      if (!Array.isArray(response.data))
        throw new Error('Réponse des notifications invalide.');
      this.rows.set(response.data);
      this.page.set(page);
      this.filter.set(filter);
      this.totalPages.set(Math.max(1, response.pagination?.total_pages ?? 1));
      this.totalItems.set(
        response.pagination?.total_items ?? response.data.length,
      );
      this.supportsReadActions.set(response.schema_version === 2);
      if (page === 1) void this.loadUnreadCount();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Notifications indisponibles.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async loadUnreadCount(): Promise<void> {
    try {
      const response = await this.#functions.get<NotificationResponse>(
        'get-notifications',
        {
          page: '1',
          limit: '1',
          filter: 'unread',
        },
      );
      const count = response.pagination?.total_items;
      this.unreadCount.set(typeof count === 'number' ? count : null);
    } catch {
      this.unreadCount.set(null);
    }
  }

  async updateState(
    id: string,
    action: AdminNotificationAction,
  ): Promise<void> {
    if (!this.supportsReadActions()) return;
    if (this.actionBusy()) return;
    const client = this.#supabase.client;
    if (!client) {
      this.actionError.set('Session indisponible.');
      throw new Error('Session indisponible.');
    }
    this.actionBusy.set(true);
    this.actionError.set('');
    try {
      const { error } = await client.rpc('set_notification_state_v1', {
        p_notification_id: id,
        p_action: action,
      });
      if (error) throw new Error('Impossible de modifier cette notification.');
      const current = this.rows().find((row) => row.notification_id === id);
      if (current) {
        const nextRead =
          action === 'read' ? true : action === 'unread' ? false : null;
        const filteredOut =
          action === 'delete' ||
          (this.filter() === 'unread' && nextRead === false) ||
          (this.filter() === 'read' && nextRead === true);
        if (filteredOut) {
          this.rows.update((rows) =>
            rows.filter((row) => row.notification_id !== id),
          );
          this.totalItems.update((count) => Math.max(0, count - 1));
          this.totalPages.set(Math.max(1, Math.ceil(this.totalItems() / 30)));
          if (!this.rows().length && this.page() > 1) {
            await this.load(this.page() - 1, this.filter());
          }
        } else if (nextRead !== null) {
          this.rows.update((rows) =>
            rows.map((row) =>
              row.notification_id === id ? { ...row, is_read: nextRead } : row,
            ),
          );
        }
        if (action === 'delete' && current.is_read === false) {
          this.unreadCount.update((count) =>
            count === null ? null : Math.max(0, count - 1),
          );
        } else if (action === 'read' && current.is_read === false) {
          this.unreadCount.update((count) =>
            count === null ? null : Math.max(0, count - 1),
          );
        } else if (action === 'unread' && current.is_read === true) {
          this.unreadCount.update((count) =>
            count === null ? null : count + 1,
          );
        }
      }
    } catch (error) {
      this.actionError.set(
        error instanceof Error ? error.message : 'Action impossible.',
      );
      throw error;
    } finally {
      this.actionBusy.set(false);
    }
  }

  removeLocal(id: string): void {
    const existing = this.rows().find((row) => row.notification_id === id);
    if (!existing) return;
    this.rows.update((rows) =>
      rows.filter((row) => row.notification_id !== id),
    );
    this.totalItems.update((count) => Math.max(0, count - 1));
    this.totalPages.set(Math.max(1, Math.ceil(this.totalItems() / 30)));
    if (!existing.is_read)
      this.unreadCount.update((count) =>
        count === null ? null : Math.max(0, count - 1),
      );
    if (!this.rows().length && this.page() > 1)
      void this.load(this.page() - 1, this.filter());
  }
}
