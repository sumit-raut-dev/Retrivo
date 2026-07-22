import { Component, signal, AfterViewInit, OnDestroy, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { GoogleAuth } from '../../core/services/google-auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Register implements AfterViewInit, OnDestroy {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;

  fullName = '';
  email = '';
  password = '';
  phone = '';
  showPassword = signal<boolean>(false);
  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private googleSub?: Subscription;

  constructor(private auth: Auth, private router: Router, private googleAuth: GoogleAuth) {}

  ngAfterViewInit(): void {
    this.googleAuth.renderButton(this.googleBtnRef.nativeElement);
    this.googleSub = this.googleAuth.credentialReceived.subscribe(credential => {
      this.handleGoogleCredential(credential);
    });
  }

  ngOnDestroy(): void {
    this.googleSub?.unsubscribe();
  }

  handleGoogleCredential(credential: string): void {
    this.errorMessage.set(null);
    this.submitting.set(true);

    this.auth.googleLogin(credential).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/']);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Google sign-in failed.');
        this.submitting.set(false);
      }
    });
  }

  submit(): void {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    this.auth.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      phone: this.phone || undefined
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/']);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Something went wrong. Please try again.');
        this.submitting.set(false);
      }
    });
  }
}