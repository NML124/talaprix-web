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
}

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
  readonly loading = signal(false);
  readonly error = signal('');
  readonly supportsReadActions = signal(false);
  readonly unreadCount = signal<number | null>(null);

  async load(page = this.page()): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await this.#functions.get<NotificationResponse>(
        'get-notifications',
        {
          page: String(page),
          limit: '30',
          filter: 'all',
        },
      );
      if (!Array.isArray(response.data))
        throw new Error('Réponse des notifications invalide.');
      this.rows.set(response.data);
      this.page.set(page);
      this.totalPages.set(Math.max(1, response.pagination?.total_pages ?? 1));
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

  async markRead(id: string): Promise<void> {
    if (!this.supportsReadActions()) return;
    const client = this.#supabase.client;
    if (!client) throw new Error('Session indisponible.');
    const { error } = await client.rpc('set_notification_state_v1', {
      p_notification_id: id,
      p_action: 'read',
    });
    if (error)
      throw new Error('Impossible de marquer la notification comme lue.');
    this.rows.update((rows) =>
      rows.map((row) =>
        row.notification_id === id ? { ...row, is_read: true } : row,
      ),
    );
    this.unreadCount.update((count) =>
      count === null ? null : Math.max(0, count - 1),
    );
  }
}
