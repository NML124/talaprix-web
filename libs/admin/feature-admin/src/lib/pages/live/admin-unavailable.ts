import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageHeader } from '../../ui/page-header';

const sections: Record<
  string,
  { title: string; subtitle: string; cards: string[] }
> = {
  rapports: {
    title: 'Rapports',
    subtitle: 'Suivez les indicateurs de votre activité.',
    cards: [
      'Économies estimées',
      'Évolution des prix',
      'Produits suivis',
      'Boutiques les mieux notées',
    ],
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Retrouvez les événements de votre espace.',
    cards: ['Boîte de notifications', 'Préférences de notification'],
  },
  publicites: {
    title: 'Marketing',
    subtitle: 'Pilotez les campagnes et leur visibilité.',
    cards: ['Campagnes', 'Emplacements', 'Performance'],
  },
  equipe: {
    title: 'Équipe et accès',
    subtitle: 'Gérez les collaborateurs et leurs accès.',
    cards: ['Membres de l’équipe', 'Invitations', 'Journal d’audit'],
  },
  roles: {
    title: 'Rôles et permissions',
    subtitle: 'Consultez les accès disponibles.',
    cards: ['Rôles', 'Matrice des permissions'],
  },
  profil: {
    title: 'Mon profil',
    subtitle: 'Consultez les informations de votre compte.',
    cards: ['Informations du profil', 'Sessions et sécurité'],
  },
};

@Component({
  selector: 'tp-admin-unavailable',
  imports: [PageHeader],
  templateUrl: './admin-unavailable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUnavailable {
  readonly #route = inject(ActivatedRoute);
  protected readonly section = sections[
    this.#route.snapshot.routeConfig?.path ?? ''
  ] ?? {
    title: 'Administration',
    subtitle: 'Données de cette section.',
    cards: ['Données'],
  };
}
