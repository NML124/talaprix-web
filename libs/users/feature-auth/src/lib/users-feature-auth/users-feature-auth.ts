import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideEye,
  LucideEyeOff,
  LucideLockKeyhole,
  LucideMail,
} from '@lucide/angular';

@Component({
  selector: 'lib-users-feature-auth',
  imports: [
    FormsModule,
    RouterLink,
    LucideArrowLeft,
    LucideArrowRight,
    LucideEye,
    LucideEyeOff,
    LucideLockKeyhole,
    LucideMail,
  ],
  templateUrl: './users-feature-auth.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFeatureAuth {
  protected email = '';
  protected password = '';
  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly error = signal('');
  protected readonly info = signal('');

  protected togglePassword(): void {
    this.showPassword.update((isVisible) => !isVisible);
  }

  protected async submit(): Promise<void> {
    this.error.set('');
    this.info.set('');

    if (!this.email.trim() || !this.password) {
      this.error.set('Renseignez votre adresse email et votre mot de passe.');
      return;
    }

    if (!this.isEmailValid(this.email)) {
      this.error.set('Saisissez une adresse email valide.');
      return;
    }

    if (this.password.length < 8) {
      this.error.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    this.isSubmitting.set(true);
    await Promise.resolve();
    this.isSubmitting.set(false);
    this.info.set(
      'L’API d’authentification n’est pas encore connectée. Aucun compte n’a été connecté.',
    );
  }

  protected startGoogleSignIn(): void {
    this.error.set('');
    this.info.set(
      'La connexion Google sera disponible lorsque l’API d’authentification sera configurée.',
    );
  }

  private isEmailValid(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
}
