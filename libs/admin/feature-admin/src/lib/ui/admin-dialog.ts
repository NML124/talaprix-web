import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'tp-admin-dialog',
  imports: [LucideX],
  templateUrl: './admin-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDialog {
  readonly title = input.required<string>();
  readonly closed = output<void>();
  private readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected dismiss(): void {
    this.dialog().nativeElement.close();
  }

  protected dismissBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.dismiss();
  }
}
