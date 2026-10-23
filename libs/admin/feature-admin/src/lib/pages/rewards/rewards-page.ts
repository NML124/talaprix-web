import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideGift,
  LucidePencil,
  LucideSearch,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { AdminDialog } from '../../ui/admin-dialog';
import { PageHeader } from '../../ui/page-header';
import type { RewardItem } from './reward-models';
import { rewardFixtures } from './reward-models';
import { RewardDialog } from './reward-dialog';

@Component({
  selector: 'tp-rewards-page',
  imports: [
    FormsModule,
    AdminDialog,
    PageHeader,
    RewardDialog,
    LucideGift,
    LucidePencil,
    LucideSearch,
    LucidePlus,
    LucideTrash2,
  ],
  host: { class: 'grid min-w-0 content-start gap-6' },
  templateUrl: './rewards-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardsPage {
  protected readonly rewards = signal<RewardItem[]>(
    structuredClone(rewardFixtures),
  );
  protected readonly editing = signal<RewardItem | null | undefined>(undefined);
  protected readonly removing = signal<RewardItem | null>(null);
  protected readonly toast = signal('');
  protected readonly query = signal('');
  protected readonly filteredRewards = computed(() => {
    const term = this.query().trim().toLocaleLowerCase('fr');
    return this.rewards().filter((reward) =>
      `${reward.name} ${reward.points}`.toLocaleLowerCase('fr').includes(term),
    );
  });

  protected create(): void {
    this.editing.set({
      id: crypto.randomUUID(),
      name: '',
      points: 1,
      image: '',
    });
  }

  protected edit(reward: RewardItem): void {
    this.editing.set({ ...reward });
  }

  protected save(reward: RewardItem): void {
    this.rewards.update((rows) => {
      const exists = rows.some((row) => row.id === reward.id);
      return exists
        ? rows.map((row) => (row.id === reward.id ? reward : row))
        : [...rows, reward].sort((a, b) => a.points - b.points);
    });
    this.editing.set(undefined);
    this.toast.set('Cadeau enregistré.');
  }

  protected remove(): void {
    const reward = this.removing();
    if (!reward) return;
    this.rewards.update((rows) => rows.filter((row) => row.id !== reward.id));
    this.removing.set(null);
    this.toast.set('Cadeau supprimé.');
  }
}
