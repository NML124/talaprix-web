import {
  computed,
  inject,
  makeEnvironmentProviders,
  Service,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import {
  mapCategory,
  visibleCategories,
  type Category,
} from '@talaprix/products/domain';
import { SupabaseFunctions } from '@talaprix/shared/data-access';

export type CategoryStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

@Service({ autoProvided: false })
export class CategoryStore {
  readonly #functions = inject(SupabaseFunctions);
  readonly #categories = signal<readonly Category[]>([]);
  readonly #status = signal<CategoryStatus>('idle');
  readonly #error = signal('');
  readonly categories = computed(() => visibleCategories(this.#categories()));
  readonly status = this.#status.asReadonly();
  readonly error = this.#error.asReadonly();

  async load(): Promise<void> {
    this.#status.set('loading');
    this.#error.set('');
    try {
      const response = await this.#functions.get<unknown>('get-categories');
      const values = Array.isArray(response)
        ? response
        : isRecord(response) && Array.isArray(response['data'])
          ? response['data']
          : [];
      this.#categories.set(
        values
          .map(mapCategory)
          .filter((value): value is Category => value !== null),
      );
      this.#status.set(this.categories().length ? 'success' : 'empty');
    } catch (error: unknown) {
      this.#status.set('error');
      this.#error.set(
        error instanceof Error
          ? error.message
          : 'Impossible de charger les catégories.',
      );
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function provideCategoriesDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([CategoryStore]);
}
