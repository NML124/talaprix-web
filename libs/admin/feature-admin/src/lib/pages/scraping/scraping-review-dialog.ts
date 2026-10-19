import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDialog } from '../../ui/admin-dialog';
import type { CandidateDetail, ReviewState } from './scraping-review.models';

@Component({
  selector: 'tp-scraping-review-dialog',
  imports: [AdminDialog, FormsModule, DatePipe],
  templateUrl: './scraping-review-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingReviewDialog {
  readonly candidate = input.required<CandidateDetail>();
  readonly saving = input(false);
  readonly closed = output<void>();
  readonly decided = output<{
    candidateId: string;
    decision: ReviewState;
    reason: string;
  }>();
  protected readonly decision = signal<'approved' | 'rejected' | null>(null);
  protected readonly reason = signal('');
  protected readonly error = signal('');

  protected json(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  protected askDecision(value: 'approved' | 'rejected'): void {
    if (value === 'approved') {
      this.decided.emit({
        candidateId: this.candidate().candidate_id,
        decision: value,
        reason: '',
      });
      return;
    }
    this.decision.set(value);
  }

  protected confirmReject(): void {
    const reason = this.reason().trim();
    if (!reason) {
      this.error.set('Ajoutez un motif pour enregistrer le rejet.');
      return;
    }
    this.decided.emit({
      candidateId: this.candidate().candidate_id,
      decision: 'rejected',
      reason,
    });
  }
}
