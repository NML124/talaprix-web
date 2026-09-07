import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideBadgePercent,
  LucideCircleHelp,
  LucideShieldCheck,
} from '@lucide/angular';

@Component({
  selector: 'lib-home-trust',
  imports: [LucideBadgePercent, LucideCircleHelp, LucideShieldCheck],
  templateUrl: './home-trust.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeTrust {}
