import type { SupabaseFunctions } from '@talaprix/shared/data-access';
import type { PendingAdminAction } from './admin-live-confirm';
import type { Resource } from './admin-live-row';

export async function applyAdminLifecycle(
  api: SupabaseFunctions,
  resource: Resource,
  pending: PendingAdminAction,
): Promise<string> {
  await api.post('admin-catalogue-manage', {
    resource,
    id: pending.row.id,
    action: pending.action,
  });
  return {
    pause: 'Élément arrêté.',
    resume: 'Élément réactivé.',
    archive: 'Élément archivé.',
    restore: 'Élément restauré. Réactivez-le pour le rendre visible.',
  }[pending.action];
}
