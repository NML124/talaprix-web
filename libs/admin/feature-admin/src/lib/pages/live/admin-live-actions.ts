import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  LucidePause,
  LucidePencil,
  LucidePlay,
  LucideRotateCcw,
  LucideTrash2,
} from '@lucide/angular';
import type { AdminAction } from './admin-live-confirm';
import type { Row } from './admin-live-row';

@Component({
  selector: 'tp-admin-live-actions',
  imports: [
    LucidePause,
    LucidePencil,
    LucidePlay,
    LucideRotateCcw,
    LucideTrash2,
  ],
  templateUrl: './admin-live-actions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveActions {
  readonly row = input.required<Row>();
  readonly blocked = input(false);
  readonly busy = input(false);
  readonly editing = input(false);
  readonly updated = input(false);
  readonly edit = output<void>();
  readonly action = output<AdminAction>();

  readonly stopAction = (): AdminAction =>
    this.row().paused ? 'resume' : 'pause';
  readonly archiveAction = (): AdminAction =>
    this.row().archived ? 'restore' : 'archive';
}
