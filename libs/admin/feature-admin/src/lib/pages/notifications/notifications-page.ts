import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminNotificationPreview } from '../../services/admin-notification-preview';
import { AdminDialog } from '../../ui/admin-dialog';
import { PageHeader } from '../../ui/page-header';

@Component({
  selector: 'tp-admin-notifications-page',
  host: { class: 'grid min-w-0 content-start gap-6' },
  imports: [FormsModule, AdminDialog, PageHeader],
  templateUrl: './notifications-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly inbox = inject(AdminNotificationPreview);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly selected = computed(
    () =>
      this.inbox.notices().find((row) => row.id === this.selectedId()) ?? null,
  );
  protected readonly rejecting = signal(false);
  protected readonly reason = signal('');
  protected readonly error = signal('');
  protected readonly feedback = signal('');

  constructor() {
    const requestId = Number(this.route.snapshot.queryParamMap.get('request'));
    if (requestId > 0) queueMicrotask(() => this.open(requestId));
  }
  protected open(id: number): void {
    const notice = this.inbox.notices().find((row) => row.id === id);
    if (!notice) return;
    this.inbox.markRead(id);
    this.error.set('');
    this.reason.set('');
    this.rejecting.set(false);
    if (notice.kind !== 'shop_request') {
      void this.router.navigateByUrl(
        notice.kind === 'moderation' ? '/admin/moderation' : '/admin/scraping',
      );
      return;
    }
    this.selectedId.set(id);
  }
  protected close(): void {
    this.selectedId.set(null);
    this.rejecting.set(false);
    this.error.set('');
  }
  protected decide(decision: 'approved' | 'rejected'): void {
    const id = this.selectedId();
    if (id === null) return;
    try {
      this.inbox.decide(id, decision, this.reason());
      this.feedback.set(
        decision === 'approved'
          ? 'Demande de boutique acceptée.'
          : 'Demande de boutique refusée.',
      );
      this.close();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Décision impossible.',
      );
    }
  }
}
