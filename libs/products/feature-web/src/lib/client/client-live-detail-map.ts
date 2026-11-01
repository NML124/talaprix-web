import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  type ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { CatalogOffer } from '@talaprix/products/data-access';
import {
  currentPosition,
  distanceKm,
  MapboxApi,
  type LatLon,
  type MapRoute,
} from '@talaprix/shared/data-access';
import type { Map as MapboxMap } from 'mapbox-gl';
import { directionsUrl } from './client-live-detail-format';

/** Distance between the visitor and one shop, drawn on a Mapbox map. */
@Component({
  selector: 'tpx-client-live-detail-map',
  templateUrl: './client-live-detail-map.html',
  host: { class: 'contents', '(document:keydown.escape)': 'dismiss.emit()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailMap {
  readonly offer = input.required<CatalogOffer>();
  readonly dismiss = output<void>();
  readonly mapbox = inject(MapboxApi);
  readonly container = viewChild<ElementRef<HTMLDivElement>>('map');
  readonly status = signal<'locating' | 'ready' | 'denied'>('locating');
  readonly route = signal<MapRoute | null>(null);
  readonly straightKm = signal<number | null>(null);
  readonly directions = computed(() =>
    directionsUrl(this.offer().shopLat, this.offer().shopLon, this.offer().shopAddress),
  );
  #map: MapboxMap | null = null;

  constructor() {
    afterNextRender(() => void this.draw());
    inject(DestroyRef).onDestroy(() => this.#map?.remove());
  }

  /** Mapbox CSS is only needed here, so it is not part of the global bundle. */
  private loadStyles(document: Document): void {
    if (document.getElementById('mapbox-gl-css')) return;
    const link = document.createElement('link');
    link.id = 'mapbox-gl-css';
    link.rel = 'stylesheet';
    link.href = '/assets/vendor/mapbox-gl.css';
    document.head.appendChild(link);
  }

  formatKm(value: number): string {
    return `${value < 10 ? value.toFixed(1) : Math.round(value)} km`.replace('.', ',');
  }

  formatMinutes(value: number): string {
    const minutes = Math.max(1, Math.round(value));
    return minutes < 60
      ? `${minutes} min`
      : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
  }

  private async draw(): Promise<void> {
    const { shopLat, shopLon } = this.offer();
    if (shopLat === null || shopLon === null) return;
    const shop: LatLon = { lat: shopLat, lon: shopLon };
    const [me, map] = await Promise.all([currentPosition(), this.createMap(shop)]);
    if (!me) {
      this.status.set('denied');
      return;
    }
    this.straightKm.set(distanceKm(me, shop));
    this.status.set('ready');
    const route = await this.mapbox.route(me, shop).catch(() => null);
    this.route.set(route);
    if (!map) return;
    const { default: mapboxgl } = await import('mapbox-gl');
    new mapboxgl.Marker({ color: '#1d6e99' }).setLngLat([me.lon, me.lat]).addTo(map);
    const line = route?.coordinates ?? [
      [me.lon, me.lat],
      [shop.lon, shop.lat],
    ];
    const show = () => {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: line.map((p) => [...p]) },
        },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#007a6c',
          'line-width': 5,
          ...(route ? {} : { 'line-dasharray': [1.5, 1.5] }),
        },
      });
      const bounds = new mapboxgl.LngLatBounds();
      line.forEach(([lon, lat]) => bounds.extend([lon, lat]));
      map.fitBounds(bounds, { padding: 56, duration: 600, maxZoom: 15 });
    };
    if (map.loaded()) show();
    else map.once('load', show);
  }

  private async createMap(shop: LatLon): Promise<MapboxMap | null> {
    const config = this.mapbox.config;
    const element = this.container()?.nativeElement;
    if (!config || !element) return null;
    this.loadStyles(element.ownerDocument);
    const { default: mapboxgl } = await import('mapbox-gl');
    const map = new mapboxgl.Map({
      container: element,
      accessToken: config.token,
      style: config.style,
      center: [shop.lon, shop.lat],
      zoom: 13,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    new mapboxgl.Marker({ color: '#007a6c' }).setLngLat([shop.lon, shop.lat]).addTo(map);
    this.#map = map;
    return map;
  }
}
