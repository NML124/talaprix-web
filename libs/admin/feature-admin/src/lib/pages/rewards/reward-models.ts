export interface RewardItem {
  id: string;
  name: string;
  points: number;
  image: string;
}

export function toRewardItem(value: unknown): RewardItem | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row['reward_id'] !== 'string' ||
    typeof row['description'] !== 'string'
  )
    return null;
  const points = Number(row['points']);
  if (!Number.isFinite(points)) return null;
  return {
    id: row['reward_id'],
    name: row['description'],
    points,
    image: typeof row['photo'] === 'string' ? row['photo'] : '',
  };
}
