import {
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  Service,
  type EnvironmentProviders,
} from '@angular/core';

export interface MapboxRuntimeConfig {
  /** Public `pk.` token restricted to the site's URLs in the Mapbox dashboard. */
  readonly token: string;
  readonly style: string;
}

export interface LatLon {
  readonly lat: number;
  readonly lon: number;
}

export interface MapRoute {
  readonly distanceKm: number;
  readonly durationMin: number;
  /** GeoJSON LineString coordinates, `[lon, lat]` pairs. */
  readonly coordinates: readonly (readonly [number, number])[];
}

export const MAPBOX_RUNTIME_CONFIG = new InjectionToken<MapboxRuntimeConfig>(
  'MAPBOX_RUNTIME_CONFIG',
);

export function provideMapboxConfig(
  config: MapboxRuntimeConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MAPBOX_RUNTIME_CONFIG, useValue: config },
  ]);
}

/** Mapbox web services used by the mobile app: geocoding and driving route. */
@Service()
export class MapboxApi {
  readonly #config = inject(MAPBOX_RUNTIME_CONFIG, { optional: true });

  get config(): MapboxRuntimeConfig | null {
    return this.#config?.token.startsWith('pk.') ? this.#config : null;
  }

  get enabled(): boolean {
    return this.config !== null;
  }

  /** Street-level address for a position, in French, or null. */
  async reverseGeocode(position: LatLon): Promise<string | null> {
    const config = this.config;
    if (!config) return null;
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.lon.toFixed(6)},${position.lat.toFixed(6)}.json`,
    );
    url.searchParams.set('access_token', config.token);
    url.searchParams.set('language', 'fr');
    url.searchParams.set(
      'types',
      'address,neighborhood,locality,place,district',
    );
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const features = isRecord(body) ? body['features'] : null;
    const first = Array.isArray(features) ? features[0] : null;
    return isRecord(first) && typeof first['place_name'] === 'string'
      ? first['place_name']
      : null;
  }

  async route(from: LatLon, to: LatLon): Promise<MapRoute | null> {
    const config = this.config;
    if (!config) return null;
    const url = new URL(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lon},${from.lat};${to.lon},${to.lat}`,
    );
    url.searchParams.set('access_token', config.token);
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('overview', 'full');
    url.searchParams.set('alternatives', 'false');
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const routes = isRecord(body) ? body['routes'] : null;
    const route = Array.isArray(routes) ? routes[0] : null;
    if (!isRecord(route) || !isRecord(route['geometry'])) return null;
    const coordinates = route['geometry']['coordinates'];
    if (!Array.isArray(coordinates)) return null;
    return {
      distanceKm: Number(route['distance'] ?? 0) / 1000,
      durationMin: Number(route['duration'] ?? 0) / 60,
      coordinates: coordinates.filter(
        (point): point is [number, number] =>
          Array.isArray(point) &&
          typeof point[0] === 'number' &&
          typeof point[1] === 'number',
      ),
    };
  }
}

/** Straight-line distance in km (haversine), used when no route is available. */
export function distanceKm(from: LatLon, to: LatLon): number {
  const rad = Math.PI / 180;
  const dLat = (to.lat - from.lat) * rad;
  const dLon = (to.lon - from.lon) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from.lat * rad) * Math.cos(to.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Browser position, or null when unavailable or refused. */
export function currentPosition(): Promise<LatLon | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation)
    return Promise.resolve(null);
  return new Promise((resolve) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 120_000 },
    ),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
