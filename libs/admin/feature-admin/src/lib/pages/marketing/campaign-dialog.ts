import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Campaign } from '../../mocks/models';
import { AdminDialog } from '../../ui/admin-dialog';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { AdminSelect } from '../../ui/admin-select';

export interface CampaignDraft {
  title: string;
  message: string;
  channel: string;
  commune: string;
  date: string;
  hour: string;
}

@Component({
  selector: 'tp-campaign-dialog',
  imports: [AdminDialog, FormsModule, SegmentedTabs, AdminSelect],
  templateUrl: './campaign-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDialog {
  readonly campaign = input<Campaign | null>(null);
  readonly closed = output<void>();
  readonly saved = output<CampaignDraft>();
  protected readonly draft = signal<CampaignDraft | null>(null);
  protected readonly error = signal('');
  protected value(): CampaignDraft {
    return (
      this.draft() ?? {
        title: this.campaign()?.name ?? '',
        message: this.campaign()?.message ?? '',
        channel: 'Push',
        commune: 'Gombe',
        date: '2026-10-05',
        hour: '09:00',
      }
    );
  }
  protected change(field: keyof CampaignDraft, value: string): void {
    this.draft.set({ ...this.value(), [field]: value });
    this.error.set('');
  }
  protected submit(): void {
    const value = this.value();
    if (!value.title.trim()) {
      this.error.set('Saisissez un titre avant d’enregistrer.');
      return;
    }
    if (!value.message.trim()) {
      this.error.set('Rédigez un message avant de programmer l’envoi.');
      return;
    }
    this.saved.emit(value);
  }
}
