import { isRecord } from './admin-live-row';

export interface DeleteImpactCount {
  readonly key: string;
  readonly label: string;
  readonly count: number;
}
export interface DeleteImpact {
  readonly id: string;
  readonly resource: string;
  readonly plan_hash: string;
  readonly can_delete: boolean;
  readonly removed: readonly DeleteImpactCount[];
  readonly updated: readonly DeleteImpactCount[];
  readonly blockers: readonly DeleteImpactCount[];
}

export function deleteImpact(payload: unknown): DeleteImpact {
  const row = isRecord(payload) ? payload['result'] : null;
  if (
    !isRecord(row) ||
    typeof row['id'] !== 'string' ||
    typeof row['resource'] !== 'string' ||
    typeof row['plan_hash'] !== 'string' ||
    !/^[a-f0-9]{64}$/.test(row['plan_hash']) ||
    typeof row['can_delete'] !== 'boolean'
  )
    throw new Error('Aperçu de suppression invalide.');
  const counts = (value: unknown): DeleteImpactCount[] => {
    if (!Array.isArray(value))
      throw new Error('Aperçu de suppression incomplet.');
    return value.map((item: unknown) => {
      if (
        !isRecord(item) ||
        typeof item['key'] !== 'string' ||
        typeof item['label'] !== 'string' ||
        typeof item['count'] !== 'number' ||
        !Number.isSafeInteger(item['count']) ||
        item['count'] <= 0
      )
        throw new Error('Impact de suppression invalide.');
      return { key: item['key'], label: item['label'], count: item['count'] };
    });
  };
  const removed = counts(row['removed']);
  const updated = counts(row['updated']);
  const blockers = counts(row['blockers']);
  if (!removed.length || row['can_delete'] !== (blockers.length === 0))
    throw new Error('Impact de suppression incohérent.');
  return {
    id: row['id'],
    resource: row['resource'],
    plan_hash: row['plan_hash'],
    can_delete: row['can_delete'],
    removed,
    updated,
    blockers,
  };
}
