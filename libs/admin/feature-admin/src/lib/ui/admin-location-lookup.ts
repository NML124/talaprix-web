import {
  ChangeDetectionStrategy,
  Component,
  inject,
  DestroyRef,
  output,
  signal,
} from '@angular/core';
import { MapboxApi, type PlaceSuggestion } from '@talaprix/shared/data-access';

@Component({
  selector: 'tp-admin-location-lookup',
  templateUrl: './admin-location-lookup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLocationLookup {
  private timer?: ReturnType<typeof setTimeout>;
  private revision = 0;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.revision++;
    });
  }
  suggest(query: string) {
    clearTimeout(this.timer);
    const revision = ++this.revision;
    this.results.set([]);
    this.error.set('');
    this.loading.set(false);
    if (this.mapbox.enabled && query.trim().length >= 3)
      this.timer = setTimeout(() => void this.search(query, revision), 300);
  }
  readonly selected = output<PlaceSuggestion>();
  protected readonly mapbox = inject(MapboxApi);
  protected readonly results = signal<readonly PlaceSuggestion[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  private async search(query: string, revision: number): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      const places = await this.mapbox.searchPlaces(query);
      if (revision !== this.revision) return;
      this.results.set(places);
      if (!places.length)
        this.error.set(
          'Aucune adresse trouvée. Ajustez le texte ou saisissez les coordonnées.',
        );
    } catch (error) {
      if (revision !== this.revision) return;
      this.error.set(
        error instanceof Error ? error.message : 'Recherche indisponible.',
      );
    } finally {
      if (revision === this.revision) this.loading.set(false);
    }
  }

  protected choose(place: PlaceSuggestion): void {
    this.selected.emit(place);
    this.results.set([]);
  }
}
