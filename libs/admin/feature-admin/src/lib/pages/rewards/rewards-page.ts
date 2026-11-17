import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
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
import { toRewardItem } from './reward-models';
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
  readonly #functions = inject(SupabaseFunctions);
  protected readonly rewards = signal<RewardItem[]>([]);
  protected readonly editing = signal<RewardItem | null | undefined>(undefined);
  protected readonly removing = signal<RewardItem | null>(null);
  protected readonly toast = signal('');
  protected readonly error = signal('');
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly query = signal('');
  protected readonly filteredRewards = computed(() => {
    const term = this.query().trim().toLocaleLowerCase('fr');
    return this.rewards().filter((reward) =>
      `${reward.name} ${reward.points}`.toLocaleLowerCase('fr').includes(term),
    );
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await this.#functions.get<unknown>('rewards');
      if (
        !response ||
        typeof response !== 'object' ||
        !('rewards' in response) ||
        !Array.isArray(response.rewards)
      )
        throw new Error('Réponse des récompenses invalide.');
      this.rewards.set(response.rewards.map(toRewardItem).filter(isRewardItem));
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Chargement impossible.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected create(): void {
    this.editing.set({
      id: '',
      name: '',
      points: 1,
      image: '',
    });
  }

  protected edit(reward: RewardItem): void {
    this.editing.set({ ...reward });
  }

  protected async save(reward: RewardItem): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const photo = reward.image.startsWith('data:image/')
        ? reward.image
        : undefined;
      const body = {
        points: reward.points,
        description: reward.name,
        ...(photo
          ? { photo }
          : reward.id && !reward.image
            ? { photo: null }
            : {}),
      };
      const response = reward.id
        ? await this.#functions.put<{ reward: unknown }>(
            'rewards',
            body,
            undefined,
            { reward_id: reward.id },
          )
        : await this.#functions.post<{ reward: unknown }>('rewards', body);
      const saved = toRewardItem(response.reward);
      if (!saved) throw new Error('Réponse du cadeau invalide.');
      this.rewards.update((rows) =>
        [...rows.filter((row) => row.id !== saved.id), saved].sort(
          (a, b) => a.points - b.points,
        ),
      );
      this.editing.set(undefined);
      this.toast.set('Cadeau enregistré.');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Enregistrement impossible.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const reward = this.removing();
    if (!reward || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.#functions.delete('rewards', undefined, undefined, {
        reward_id: reward.id,
      });
      this.rewards.update((rows) => rows.filter((row) => row.id !== reward.id));
      this.removing.set(null);
      this.toast.set('Cadeau supprimé.');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Suppression impossible.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}

function isRewardItem(value: RewardItem | null): value is RewardItem {
  return value !== null;
}
