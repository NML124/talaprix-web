import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight } from '@lucide/angular';

interface RecentEntry {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
}

interface UserRoles {
  readonly users: number;
  readonly shops: number;
  readonly admins: number;
}

@Component({
  selector: 'tp-admin-recent-sections',
  imports: [RouterLink, LucideChevronRight],
  templateUrl: './admin-recent-sections.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRecentSections {
  readonly status = input.required<'loading' | 'ready' | 'error'>();
  readonly userRoles = input<UserRoles | null>(null);
  readonly categoryCount = input<number | null>(null);
  readonly advertisementCount = input<number | null>(null);
  readonly recentOffers = input.required<readonly RecentEntry[]>();
  readonly recentCategories = input.required<readonly RecentEntry[]>();
  readonly recentShops = input.required<readonly RecentEntry[]>();
}
