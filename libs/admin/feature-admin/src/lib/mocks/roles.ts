import type { PermissionDomain, PermissionAction } from './models';

export const domains: PermissionDomain[] = [
  'Catalogue',
  'Prix & avis',
  'Boutiques',
  'Promotions',
  'Communications',
  'Utilisateurs',
  'Rapports',
  'Administrateurs',
  'Rôles & permissions',
];
export const actions: PermissionAction[] = [
  'Lecture',
  'Création',
  'Modification',
  'Validation',
];
export const roles = [
  {
    name: 'Super administrateur',
    members: 1,
    description: 'Équipe, rôles et tous les domaines',
    color: '#009788',
    scope: 'Global',
  },
  {
    name: 'Administrateur',
    members: 2,
    description: 'Gestion opérationnelle hors équipe',
    color: '#6b3fb8',
    scope: 'TalaPrix · global',
  },
  {
    name: 'Modérateur',
    members: 2,
    description: 'Validation des prix et des avis',
    color: '#0a5cb8',
    scope: 'Global',
  },
  {
    name: 'Analyste',
    members: 1,
    description: 'Lecture des rapports et export',
    color: '#a84b05',
    scope: 'Global',
  },
];
const key = (domain: PermissionDomain, action: PermissionAction) =>
  `${domain}:${action}`;
export const initialPermissions = (role: string): Set<string> => {
  if (role === 'Super administrateur')
    return new Set(
      domains.flatMap((domain) => actions.map((action) => key(domain, action))),
    );
  if (role === 'Modérateur')
    return new Set([
      key('Catalogue', 'Lecture'),
      key('Prix & avis', 'Lecture'),
      key('Prix & avis', 'Modification'),
      key('Prix & avis', 'Validation'),
      key('Boutiques', 'Lecture'),
      key('Promotions', 'Lecture'),
      key('Utilisateurs', 'Lecture'),
      key('Rapports', 'Lecture'),
    ]);
  if (role === 'Analyste')
    return new Set(
      domains
        .filter(
          (domain) =>
            ![
              'Communications',
              'Utilisateurs',
              'Administrateurs',
              'Rôles & permissions',
            ].includes(domain),
        )
        .map((domain) => key(domain, 'Lecture'))
        .concat(key('Rapports', 'Création')),
    );
  return new Set(
    domains
      .slice(0, 5)
      .flatMap((domain) => actions.map((action) => key(domain, action)))
      .concat([
        key('Utilisateurs', 'Lecture'),
        key('Utilisateurs', 'Modification'),
        key('Utilisateurs', 'Validation'),
        key('Rapports', 'Lecture'),
      ]),
  );
};
