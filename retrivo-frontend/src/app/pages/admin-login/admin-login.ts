import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminLogin {
  username = '';
  password = '';
  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  constructor(private auth: Auth, private router: Router) {}

  submit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Please enter your admin username and password.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    this.auth.adminLogin({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/admin']);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Invalid admin credentials.');
        this.submitting.set(false);
      }
    });
  }
}