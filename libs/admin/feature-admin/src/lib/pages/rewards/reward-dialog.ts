import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDialog } from '../../ui/admin-dialog';
import { SingleImagePicker } from '../../ui/single-image-picker';
import type { RewardItem } from './reward-models';

@Component({
  selector: 'tp-reward-dialog',
  imports: [FormsModule, AdminDialog, SingleImagePicker],
  templateUrl: './reward-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardDialog implements OnInit {
  readonly reward = input.required<RewardItem>();
  readonly closed = output<void>();
  readonly saved = output<RewardItem>();
  protected readonly value = signal<RewardItem | null>(null);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.value.set({ ...this.reward() });
  }

  protected update(patch: Partial<RewardItem>): void {
    this.value.update((current) =>
      current ? { ...current, ...patch } : current,
    );
  }

  protected submit(): void {
    const reward = this.value();
    if (!reward?.name.trim()) {
      this.error.set('Saisissez le nom du cadeau.');
      return;
    }
    if (!Number.isInteger(reward.points) || reward.points < 1) {
      this.error.set('Le nombre de points doit être supérieur à zéro.');
      return;
    }
    this.saved.emit({ ...reward, name: reward.name.trim() });
  }
}
