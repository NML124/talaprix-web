import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { LucideCheck, LucidePencil } from '@lucide/angular';

@Component({
  selector: 'tp-admin-edit-field',
  imports: [LucideCheck, LucidePencil],
  templateUrl: './admin-edit-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEditField {
  readonly locked = input(false);
  protected readonly editing = signal(false);
  protected toggle(): void {
    this.editing.update((active) => !active);
  }
}
