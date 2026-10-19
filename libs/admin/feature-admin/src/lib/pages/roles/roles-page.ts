import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../ui/page-header';
import { AdminMockApi } from '../../services/admin-mock-api';
import { actions, domains, initialPermissions, roles } from '../../mocks/roles';
import type { PermissionDomain, PermissionAction } from '../../mocks/models';

@Component({
  selector: 'tp-roles-page',
  imports: [FormsModule, PageHeader],
  templateUrl: './roles-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPage {
  private readonly api = inject(AdminMockApi);
  protected readonly roles = roles;
  protected readonly domains = domains;
  protected readonly actions = actions;
  protected readonly selected = signal('Modérateur');
  protected readonly roleName = signal('Modérateur');
  protected readonly scope = signal('Global');
  protected readonly permissions = signal(initialPermissions('Modérateur'));
  protected readonly saved = signal(initialPermissions('Modérateur'));
  protected readonly toast = signal('');
  protected readonly changes = computed(
    () =>
      [...new Set([...this.permissions(), ...this.saved()])].filter(
        (key) => this.permissions().has(key) !== this.saved().has(key),
      ).length,
  );
  protected select(name: string): void {
    this.selected.set(name);
    this.roleName.set(name);
    this.scope.set(roles.find((role) => role.name === name)?.scope ?? 'Global');
    this.permissions.set(initialPermissions(name));
    this.saved.set(initialPermissions(name));
    this.toast.set('');
  }
  protected isReserved(domain: PermissionDomain): boolean {
    return (
      this.selected() !== 'Super administrateur' &&
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
    if (this.selected() === 'Super administrateur' || this.isReserved(domain))
      return;
    const next = new Set(this.permissions());
    const key = `${domain}:${action}`;
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.permissions.set(next);
  }
  protected cancel(): void {
    this.permissions.set(new Set(this.saved()));
    this.roleName.set(this.selected());
  }
  protected async save(): Promise<void> {
    await this.api.recordAction(
      'Modification de permissions',
      `${this.selected()} · ${this.changes()} droits`,
    );
    this.saved.set(new Set(this.permissions()));
    this.toast.set(
      'Permissions enregistrées dans la maquette et action auditée.',
    );
  }
}
