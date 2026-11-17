import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { AdminNotificationStore } from '../../services/admin-notification-store';
import { PageHeader } from '../../ui/page-header';

@Component({
  selector: 'tp-admin-live-notifications',
  imports: [DatePipe, PageHeader],
  templateUrl: './admin-live-notifications.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveNotifications {
  protected readonly inbox = inject(AdminNotificationStore);
  protected readonly actionError = signal('');

  constructor() {
    void this.inbox.load(1);
  }

  protected async markRead(id: string): Promise<void> {
    this.actionError.set('');
    try {
      await this.inbox.markRead(id);
    } catch (error) {
      this.actionError.set(
        error instanceof Error ? error.message : 'Action impossible.',
      );
    }
  }
}
