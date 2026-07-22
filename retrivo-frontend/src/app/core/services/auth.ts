import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, User , UpdateProfilePayload, ChangePasswordPayload } from '../models/user.model';
import { AdminLoginPayload, AdminAuthResponse } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(this.loadUserFromStorage());

  constructor(private http: HttpClient, private router: Router) { }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap(res => this.setSession(res)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(tap(res => this.setSession(res)));
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    const user: User = { id: res.id, fullName: res.fullName, email: res.email, phone: res.phone };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    this.currentUser.set(user);
    this.adminUser.set(null);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAdmin');
    this.currentUser.set(null);
    this.adminUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  adminUser = signal<{ id: number; fullName: string; username: string } | null>(this.loadAdminFromStorage());

  private loadAdminFromStorage(): { id: number; fullName: string; username: string } | null {
    const raw = localStorage.getItem('adminUser');
    return raw ? JSON.parse(raw) : null;
  }

  adminLogin(payload: AdminLoginPayload): Observable<AdminAuthResponse> {
    return this.http.post<AdminAuthResponse>(`${this.apiUrl}/admin/login`, payload)
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('isAdmin', 'true');
        const admin = { id: res.id, fullName: res.fullName, username: res.username };
        localStorage.setItem('adminUser', JSON.stringify(admin));
        this.adminUser.set(admin);
      }));
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && localStorage.getItem('isAdmin') === 'true';
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { idToken })
      .pipe(tap(res => this.setSession(res)));
  }

  updateProfile(payload: UpdateProfilePayload): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, payload).pipe(
      tap(updatedUser => {
        const current = this.currentUser();
        const merged: User = { ...current, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(merged));
        this.currentUser.set(merged);
      })
    );
  }

  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/change-password`, payload);
  }
}