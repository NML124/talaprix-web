import type { Campaign } from './models';

const promotionDate = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const today = new Date();
today.setHours(12, 0, 0, 0);
function shiftedDate(offset: number): Date {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date;
}
function promotionRange(startOffset: number, endOffset: number): string {
  return `${promotionDate.format(shiftedDate(startOffset))} – ${promotionDate.format(shiftedDate(endOffset))}`;
}

export const campaigns: Campaign[] = [
  {
    id: 1,
    name: 'Les prix baissent près de vous',
    channel: 'Notification plateforme',
    audience: 'Gombe · 1 840',
    date: `${promotionDate.format(shiftedDate(5))} · 09:00`,
    status: 'Programmée',
    action: 'Modifier',
  },
  {
    id: 2,
    name: 'Vos favoris au meilleur prix',
    channel: 'Email',
    audience: '3 260 abonnés',
    date: '03 oct. · 10:00',
    status: 'Envoyée',
    action: 'Rapport',
  },
  {
    id: 3,
    name: 'Nouvelles boutiques à Limete',
    channel: 'Message in-app',
    audience: 'Limete · 2 120',
    date: 'À définir',
    status: 'Brouillon',
    action: 'Modifier',
  },
  {
    id: 4,
    name: 'Point mensuel TalaPrix',
    channel: 'Email',
    audience: '8 412 actifs',
    date: '01 oct. · 08:30',
    status: 'Envoyée',
    action: 'Rapport',
  },
];
export const promotions = [
  {
    title: 'La pause à petit prix',
    tagline: 'LE BON PRIX, PRÈS DE VOUS',
    detail: "S&K · Chips Lay's 3 800 FC",
    image: 'chipsbig.png',
    dates: promotionRange(-3, 4),
    status: 'Active',
    style: '',
  },
  {
    title: 'Le pain du quotidien',
    tagline: 'TOUS LES JOURS À BON PRIX',
    detail: 'Kin Marché · dès 2 500 FC',
    image: 'painbig.png',
    dates: promotionRange(5, 12),
    status: 'Programmée',
    style: 'bread',
  },
];
export type Promotion = (typeof promotions)[number];
