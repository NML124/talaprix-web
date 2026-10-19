import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMockApi } from '../../services/admin-mock-api';
import { PageHeader } from '../../ui/page-header';
import { AdminSwitch } from '../../ui/admin-switch';
import type { AdminSession } from '../../mocks/models';

@Component({
  selector: 'tp-profile-page',
  imports: [FormsModule, PageHeader, AdminSwitch],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly api = inject(AdminMockApi);
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly actionAlerts = signal(false);
  protected readonly reports = signal(false);
  protected readonly daily = signal(false);
  protected readonly sessions = signal<AdminSession[]>([]);
  protected readonly toast = signal('');
  protected readonly error = signal('');
  constructor() {
    void this.api.getProfile().then(({ profile, sessions }) => {
      this.name.set(profile.name);
      this.email.set(profile.email);
      this.phone.set(profile.phone);
      this.actionAlerts.set(profile.actionAlerts);
      this.reports.set(profile.reports);
      this.daily.set(profile.daily);
      this.sessions.set(sessions);
    });
  }
  protected async save(): Promise<void> {
    if (!this.name().trim() || !this.email().includes('@')) {
      this.error.set('Renseignez un nom et un email valides.');
      return;
    }
    await this.api.recordAction('Modification du profil', this.name());
    this.toast.set('Profil enregistré dans la maquette.');
    this.error.set('');
  }
}
