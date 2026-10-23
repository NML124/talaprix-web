export interface RewardItem {
  id: string;
  name: string;
  points: number;
  image: string;
}

export const rewardFixtures: RewardItem[] = [
  { id: 'reward-1', name: 'Bon d’achat TalaPrix', points: 500, image: '' },
  { id: 'reward-2', name: 'Sac réutilisable', points: 900, image: '' },
  { id: 'reward-3', name: 'Petit électroménager', points: 2400, image: '' },
];
