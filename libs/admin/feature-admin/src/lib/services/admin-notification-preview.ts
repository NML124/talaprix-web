import { computed, Service, signal } from '@angular/core';

export type AdminNoticeStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'information';
export interface AdminNotice {
  id: number;
  kind: 'shop_request' | 'scraping';
  title: string;
  summary: string;
  time: string;
  read: boolean;
  status: AdminNoticeStatus;
  shop?: string;
  applicant?: string;
  zone?: string;
  reason?: string;
}

/** Boîte locale : aucune décision n'est transmise au backend. */
@Service()
export class AdminNotificationPreview {
  private readonly rows = signal<AdminNotice[]>([
    {
      id: 1,
      kind: 'shop_request',
      title: 'Demande pour devenir boutique',
      summary: 'Ujisha · Gombe',
      time: 'Aujourd’hui · 10:14',
      read: false,
      status: 'pending',
      shop: 'Ujisha',
      applicant: 'Compte de démonstration 01',
      zone: 'Gombe, Kinshasa',
    },
    {
      id: 3,
      kind: 'scraping',
      title: 'Collecte terminée',
      summary: 'Nouvelles annonces en attente de revue',
      time: 'Hier · 18:30',
      read: false,
      status: 'information',
    },
  ]);
  readonly notices = this.rows.asReadonly();
  readonly unreadCount = computed(
    () => this.rows().filter((row) => !row.read).length,
  );
  readonly pendingShopRequests = computed(() =>
    this.rows().filter(
      (row) => row.kind === 'shop_request' && row.status === 'pending',
    ),
  );

  markRead(id: number): void {
    this.rows.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, read: true } : row)),
    );
  }
  decide(id: number, decision: 'approved' | 'rejected', reason: string): void {
    if (decision === 'rejected' && !reason.trim())
      throw new Error('Indiquez un motif de refus.');
    this.rows.update((rows) =>
      rows.map((row) =>
        row.id === id && row.kind === 'shop_request' && row.status === 'pending'
          ? { ...row, status: decision, reason: reason.trim(), read: true }
          : row,
      ),
    );
  }
}
