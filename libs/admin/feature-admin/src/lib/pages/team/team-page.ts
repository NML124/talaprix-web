import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMockApi } from '../../services/admin-mock-api';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { StatusDot } from '../../ui/status-dot';
import type { AuditEntry, Invitation, Member } from '../../mocks/models';

@Component({
  selector: 'tp-team-page',
  imports: [FormsModule, PageHeader, SegmentedTabs, StatusDot],
  templateUrl: './team-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPage {
  private readonly api = inject(AdminMockApi);
  protected readonly members = signal<Member[]>([]);
  protected readonly audit = signal<AuditEntry[]>([]);
  protected readonly selectedId = signal(2);
  protected readonly selected = computed(
    () => this.members().find((row) => row.id === this.selectedId()) ?? null,
  );
  protected readonly editRole = signal('Administrateur');
  protected readonly editScope = signal('Kin Marché, S&K');
  protected readonly tab = signal('Membres 6');
  protected readonly tabs = ['Membres 6', 'Invitations 2', "Journal d'audit"];
  protected readonly invitationEmail = signal('');
  protected readonly invitationRole = signal('Analyste');
  protected readonly invitationScope = signal('Global');
  protected readonly invitations = signal<Invitation[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly toast = signal('');
  protected readonly confirm = signal(false);
  constructor() {
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.members.set(await this.api.listMembers());
      this.audit.set(await this.api.listAudit());
      this.invitations.set(await this.api.listInvitations());
    } catch {
      this.error.set('L’équipe est indisponible.');
    } finally {
      this.loading.set(false);
    }
  }
  protected select(row: Member): void {
    this.selectedId.set(row.id);
    this.editRole.set(row.role);
    this.editScope.set(row.scope);
    this.confirm.set(false);
  }
  protected async save(): Promise<void> {
    const row = this.selected();
    if (!row || row.id === 1) return;
    await this.api.saveMember({
      ...row,
      role: this.editRole(),
      scope: this.editScope(),
    });
    this.members.set(await this.api.listMembers());
    this.audit.set(await this.api.listAudit());
    this.toast.set('Accès enregistrés et ajoutés au journal d’audit.');
  }
  protected async toggle(): Promise<void> {
    const row = this.selected();
    if (!row || row.id === 1) return;
    await this.api.saveMember({ ...row, active: !row.active });
    this.members.set(await this.api.listMembers());
    this.audit.set(await this.api.listAudit());
    this.confirm.set(false);
    this.toast.set('État du membre modifié et audité.');
  }
  protected async invite(): Promise<void> {
    if (!this.invitationEmail().includes('@')) {
      this.error.set('Renseignez une adresse email valide.');
      return;
    }
    const email = this.invitationEmail();
    await this.api.recordAction(
      'Invitation envoyée',
      `${email} · ${this.invitationRole()}`,
    );
    this.invitations.update((rows) => [
      {
        name: email,
        role: this.invitationRole(),
        sent: "Aujourd'hui",
        expires: 'dans 7 jours',
      },
      ...rows,
    ]);
    this.toast.set('Invitation ajoutée à la liste de conception.');
    this.invitationEmail.set('');
    this.error.set('');
  }
  protected async cancelInvite(name: string): Promise<void> {
    this.invitations.update((rows) => rows.filter((row) => row.name !== name));
    await this.api.recordAction('Annulation d’invitation', name);
    this.toast.set('Invitation annulée.');
  }
}
