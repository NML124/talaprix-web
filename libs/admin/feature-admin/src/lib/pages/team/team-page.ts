import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminMockApi } from '../../services/admin-mock-api';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { StatusDot } from '../../ui/status-dot';
import type { AuditEntry, Invitation, Member } from '../../mocks/models';
import { AdminSelect } from '../../ui/admin-select';

@Component({
  selector: 'tp-team-page',
  imports: [FormsModule, PageHeader, SegmentedTabs, StatusDot, AdminSelect],
  templateUrl: './team-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPage {
  private readonly api = inject(AdminMockApi);
  private readonly route = inject(ActivatedRoute);
  protected readonly members = signal<Member[]>([]);
  protected readonly audit = signal<AuditEntry[]>([]);
  protected readonly selectedId = signal(2);
  protected readonly selected = computed(
    () => this.members().find((row) => row.id === this.selectedId()) ?? null,
  );
  protected readonly editRole = signal('Administrateur');
  protected readonly editScope = signal('Kin Marché, S&K');
  protected readonly tab = signal('Membres');
  protected readonly tabs = ['Membres', 'Invitations', "Journal d'audit"];
  protected readonly invitationEmail = signal('');
  protected readonly invitationRole = signal('Analyste');
  protected readonly invitationScope = signal('Global');
  protected readonly invitations = signal<Invitation[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly invitationError = signal('');
  protected readonly invitationSent = signal(false);
  protected readonly roleOptions = ['Administrateur', 'Modérateur', 'Analyste'];
  protected readonly globalAdminScope = 'TalaPrix · global';
  protected readonly toast = signal('');
  protected readonly confirm = signal(false);
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params.get('tab') === 'audit') this.tab.set("Journal d'audit");
    });
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
      scope:
        this.editRole() === 'Administrateur'
          ? this.globalAdminScope
          : this.editScope(),
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.invitationEmail().trim())) {
      this.invitationError.set('Renseignez une adresse email valide.');
      return;
    }
    if (
      this.invitationRole() !== 'Administrateur' &&
      !this.invitationScope().trim()
    ) {
      this.invitationError.set('Renseignez un périmètre pour cet accès.');
      return;
    }
    const email = this.invitationEmail().trim();
    await this.api.recordAction(
      'Invitation envoyée',
      `${email} · ${this.invitationRole()} · ${this.invitationRole() === 'Administrateur' ? this.globalAdminScope : this.invitationScope().trim()}`,
    );
    this.invitations.update((rows) => [
      {
        name: email,
        role: this.invitationRole(),
        scope:
          this.invitationRole() === 'Administrateur'
            ? this.globalAdminScope
            : this.invitationScope().trim(),
        sent: "Aujourd'hui",
        expires: 'dans 7 jours',
      },
      ...rows,
    ]);
    this.invitationSent.set(true);
    this.invitationEmail.set('');
    this.invitationError.set('');
  }
  protected async cancelInvite(name: string): Promise<void> {
    this.invitations.update((rows) => rows.filter((row) => row.name !== name));
    await this.api.recordAction('Annulation d’invitation', name);
    this.toast.set('Invitation annulée.');
  }
}
