import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service } from '@angular/core';

/** Initialise les composants Flowbite qui utilisent des attributs `data-*`. */
@Service()
export class FlowbiteService {
  readonly #platformId = inject(PLATFORM_ID);

  async init(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    const { initFlowbite } = await import('flowbite');
    initFlowbite();
  }
}
