import type { SavingsMonth } from '../ui/savings-chart';

export type SavingsPeriod = 'Jour' | 'Semaine' | 'Mois' | 'Année';
export const savingsPeriods: SavingsPeriod[] = [
  'Jour',
  'Semaine',
  'Mois',
  'Année',
];

/** Repères de présentation en millions de FC, à remplacer par des agrégats API. */
export const savingsByPeriod: Record<SavingsPeriod, readonly SavingsMonth[]> = {
  Jour: [
    { month: 'Lun.', current: 0.38, previous: 0.31 },
    { month: 'Mar.', current: 0.42, previous: 0.38 },
    { month: 'Mer.', current: 0.4, previous: 0.42 },
    { month: 'Jeu.', current: 0.46, previous: 0.4 },
    { month: 'Ven.', current: 0.49, previous: 0.46 },
    { month: 'Sam.', current: 0.45, previous: 0.49 },
    { month: 'Dim.', current: 0.43, previous: 0.45 },
  ],
  Semaine: [
    { month: 'S35', current: 2.4, previous: 2.1 },
    { month: 'S36', current: 2.7, previous: 2.4 },
    { month: 'S37', current: 2.9, previous: 2.7 },
    { month: 'S38', current: 3.1, previous: 2.9 },
    { month: 'S39', current: 3.2, previous: 3.1 },
  ],
  Mois: [
    { month: 'Avr.', current: 3.1, previous: 2.9 },
    { month: 'Mai', current: 4.6, previous: 3.1 },
    { month: 'Juin', current: 6.2, previous: 4.6 },
    { month: 'Juil.', current: 8.4, previous: 6.2 },
    { month: 'Août', current: 10.8, previous: 8.4 },
    { month: 'Sept.', current: 12.8, previous: 10.8 },
  ],
  Année: [
    { month: '2021', current: 31, previous: 27 },
    { month: '2022', current: 39, previous: 31 },
    { month: '2023', current: 46, previous: 39 },
    { month: '2024', current: 53, previous: 46 },
    { month: '2025', current: 58.2, previous: 53 },
    { month: '2026', current: 76.4, previous: 58.2 },
  ],
};

export const savingsPeriodNote: Record<SavingsPeriod, string> = {
  Jour: '7 derniers jours · M FC',
  Semaine: '5 dernières semaines · M FC',
  Mois: 'Avril à septembre 2026 · M FC',
  Année: 'Janvier à septembre de chaque année · M FC',
};
