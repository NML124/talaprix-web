import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tpx-client-favorites-page',
  imports: [RouterLink],
  template: `<main class="mx-auto max-w-[1100px] px-4 py-10">
    <h1 class="text-3xl font-semibold">Mes favoris</h1>
    <p class="mt-3 text-[var(--client-muted)]">
      Les favoris seront disponibles après la connexion au catalogue.
    </p>
    <a routerLink="/resultats" class="text-[var(--client-action)]"
      >Voir les produits ›</a
    >
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFavoritesPage {}
