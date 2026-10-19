import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'tp-admin-switch',
  templateUrl: './admin-switch.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSwitch {
  readonly checked = input.required<boolean>();
  readonly label = input.required<string>();
  readonly changed = output<boolean>();
}
