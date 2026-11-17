import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
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
  readonly query = input('');
  readonly selected = output<PlaceSuggestion>();
  protected readonly mapbox = inject(MapboxApi);
  protected readonly results = signal<readonly PlaceSuggestion[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected async search(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      const places = await this.mapbox.searchPlaces(this.query());
      this.results.set(places);
      if (!places.length)
        this.error.set(
          'Aucune adresse trouvée. Ajustez le texte ou saisissez les coordonnées.',
        );
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Recherche indisponible.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected choose(place: PlaceSuggestion): void {
    this.selected.emit(place);
    this.results.set([]);
  }
}
