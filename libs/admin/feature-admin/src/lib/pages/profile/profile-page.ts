import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMockApi } from '../../services/admin-mock-api';
import { PageHeader } from '../../ui/page-header';

@Component({
  selector: 'tp-profile-page',
  imports: [FormsModule, PageHeader],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly api = inject(AdminMockApi);
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly toast = signal('');
  protected readonly error = signal('');
  constructor() {
    void this.api.getProfile().then(({ profile }) => {
      this.name.set(profile.name);
      this.email.set(profile.email);
      this.phone.set(profile.phone);
    });
  }
  protected async save(): Promise<void> {
    if (!this.name().trim() || !this.email().includes('@')) {
      this.error.set('Renseignez un nom et un email valides.');
      return;
    }
    await this.api.recordAction('Modification du profil', this.name());
    this.toast.set('Profil enregistré.');
    this.error.set('');
  }
}
