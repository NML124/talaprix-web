import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeader } from '../../ui/page-header';
import { AdminMockApi } from '../../services/admin-mock-api';
import { AuthSessionStore } from '@talaprix/users/data-access';
import {
  actions,
  domains,
  initialPermissions,
  roles as defaultRoles,
} from '../../mocks/roles';
import type { PermissionDomain, PermissionAction } from '../../mocks/models';

@Component({
  selector: 'tp-roles-page',
  imports: [PageHeader],
  templateUrl: './roles-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPage {
  private readonly api = inject(AdminMockApi);
  private readonly session = inject(AuthSessionStore);
  protected readonly canEditRoles = computed(
    () => this.session.user()?.roles.includes('super-admin') ?? false,
  );
  protected readonly roleRows = defaultRoles;
  protected readonly domains = domains;
  protected readonly actions = actions;
  protected readonly selected = signal('Modérateur');
  protected readonly selectedRole = computed(
    () =>
      this.roleRows.find((role) => role.name === this.selected()) ??
      this.roleRows[0],
  );
  protected readonly roleIsLocked = computed(
    () => this.selected() === 'Super administrateur',
  );
  protected readonly permissions = signal(initialPermissions('Modérateur'));
  protected readonly saved = signal(initialPermissions('Modérateur'));
  protected readonly permissionsByRole = signal(
    new Map(
      defaultRoles.map((role) => [role.name, initialPermissions(role.name)]),
    ),
  );
  protected readonly toast = signal('');
  protected readonly changes = computed(
    () =>
      [...new Set([...this.permissions(), ...this.saved()])].filter(
        (key) => this.permissions().has(key) !== this.saved().has(key),
      ).length,
  );
  protected select(name: string): void {
    this.selected.set(name);
    const permissions = new Set(
      this.permissionsByRole().get(name) ?? initialPermissions(name),
    );
    this.permissions.set(permissions);
    this.saved.set(new Set(permissions));
    this.toast.set('');
  }
  protected isReserved(domain: PermissionDomain): boolean {
    return (
      (this.selected() !== 'Administrateur' || !this.canEditRoles()) &&
      !this.roleIsLocked() &&
      (domain === 'Administrateurs' || domain === 'Rôles & permissions')
    );
  }
  protected checked(
    domain: PermissionDomain,
    action: PermissionAction,
  ): boolean {
    return this.permissions().has(`${domain}:${action}`);
  }
  protected toggle(domain: PermissionDomain, action: PermissionAction): void {
    if (!this.canEditRoles() || this.roleIsLocked() || this.isReserved(domain))
      return;
    const next = new Set(this.permissions());
    const key = `${domain}:${action}`;
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.permissions.set(next);
    this.toast.set('');
  }
  protected cancel(): void {
    this.permissions.set(new Set(this.saved()));
    this.toast.set('');
  }
  protected async save(): Promise<void> {
    if (!this.canEditRoles() || this.roleIsLocked() || !this.changes()) return;
    await this.api.recordAction(
      'Modification des permissions',
      `${this.selected()} · ${this.changes()} changements`,
    );
    this.permissionsByRole.update((current) => {
      const next = new Map(current);
      next.set(this.selected(), new Set(this.permissions()));
      return next;
    });
    this.saved.set(new Set(this.permissions()));
    this.toast.set('Permissions enregistrées.');
  }
}
