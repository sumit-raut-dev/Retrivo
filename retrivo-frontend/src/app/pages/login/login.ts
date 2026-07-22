import { Component, signal, AfterViewInit, OnDestroy, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { GoogleAuth } from '../../core/services/google-auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Login implements AfterViewInit, OnDestroy {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;

  email = '';
  password = '';
  showPassword = signal<boolean>(false);
  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private googleSub?: Subscription;

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private googleAuth: GoogleAuth
  ) {}

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
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/']);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
        this.submitting.set(false);
      }
    });
  }
}