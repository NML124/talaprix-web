import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'tp-segmented-tabs',
  templateUrl: './segmented-tabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedTabs {
  readonly items = input.required<readonly string[]>();
  readonly selected = input.required<string>();
  readonly selectTab = output<string>();
}
