import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideFileSpreadsheet, LucideUpload, LucideX } from '@lucide/angular';
import { workbookFileError } from './scraping-workbook-file';

@Component({
  selector: 'tp-scraping-workbook-upload',
  imports: [LucideFileSpreadsheet, LucideUpload, LucideX],
  templateUrl: './scraping-workbook-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingWorkbookUpload {
  readonly disabled = input(false);
  readonly selected = output<File | null>();
  protected readonly file = signal<File | null>(null);
  protected readonly error = signal('');
  protected readonly dragging = signal(false);

  protected choose(event: Event): void {
    this.accept((event.target as HTMLInputElement).files?.[0] ?? null);
    (event.target as HTMLInputElement).value = '';
  }

  protected accept(file: File | null): void {
    if (this.disabled()) return;
    if (!file) return;
    const error = workbookFileError(file);
    this.error.set(error);
    this.file.set(error ? null : file);
    this.selected.emit(this.file());
  }

  protected drag(event: DragEvent, over: boolean): void {
    event.preventDefault();
    if (!this.disabled()) this.dragging.set(over);
  }

  protected drop(event: DragEvent): void {
    this.drag(event, false);
    this.accept(event.dataTransfer?.files[0] ?? null);
  }

  protected remove(): void {
    if (this.disabled()) return;
    this.file.set(null);
    this.error.set('');
    this.selected.emit(null);
  }

  protected size(file: File): string {
    const megabytes = file.size >= 1024 * 1024;
    return (
      new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(
        file.size / (megabytes ? 1024 * 1024 : 1024),
      ) + (megabytes ? ' Mo' : ' Ko')
    );
  }
}
