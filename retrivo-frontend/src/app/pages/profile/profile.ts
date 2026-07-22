import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Profile {
  fullName = '';
  phone = '';
  profileSubmitting = signal<boolean>(false);
  profileMessage = signal<string | null>(null);
  profileError = signal<string | null>(null);

  currentPassword = '';
  newPassword = '';
  passwordSubmitting = signal<boolean>(false);
  passwordMessage = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  constructor(public auth: Auth) {
    this.fullName = this.auth.currentUser()?.fullName ?? '';
    this.phone = this.auth.currentUser()?.phone ?? '';
  }

  saveProfile(): void {
    if (!this.fullName.trim()) {
      this.profileError.set('Full name is required.');
      return;
    }

    this.profileError.set(null);
    this.profileMessage.set(null);
    this.profileSubmitting.set(true);

    this.auth.updateProfile({ fullName: this.fullName, phone: this.phone || undefined }).subscribe({
      next: () => {
        this.profileSubmitting.set(false);
        this.profileMessage.set('Profile updated successfully.');
      },
      error: err => {
        this.profileSubmitting.set(false);
        this.profileError.set(err.error?.message || 'Failed to update profile.');
      }
    });
  }

  savePassword(): void {
    if (!this.currentPassword.trim() || !this.newPassword.trim()) {
      this.passwordError.set('Please fill in both password fields.');
      return;
    }

    this.passwordError.set(null);
    this.passwordMessage.set(null);
    this.passwordSubmitting.set(true);

    this.auth.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.passwordSubmitting.set(false);
        this.passwordMessage.set('Password changed successfully.');
        this.currentPassword = '';
        this.newPassword = '';
      },
      error: err => {
        this.passwordSubmitting.set(false);
        this.passwordError.set(err.error?.message || 'Failed to change password.');
      }
    });
  }
}