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
  readonly size = input<'default' | 'compact'>('default');
  readonly dismissible = input(true);
  readonly closed = output<void>();
  private readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected dismiss(): void {
    if (this.dismissible()) this.dialog().nativeElement.close();
  }

  protected backdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.dismiss();
  }
}
