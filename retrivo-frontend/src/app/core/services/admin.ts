import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminStats, AdminUser, StatusCount, TypeCount, CategoryCount, MonthlyActivity } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class Admin {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  getItemsByStatus(): Observable<StatusCount[]> {
    return this.http.get<StatusCount[]>(`${this.apiUrl}/items-by-status`);
  }

  getItemsByType(): Observable<TypeCount[]> {
    return this.http.get<TypeCount[]>(`${this.apiUrl}/items-by-type`);
  }

  getItemsByCategory(): Observable<CategoryCount[]> {
    return this.http.get<CategoryCount[]>(`${this.apiUrl}/items-by-category`);
  }

  getMonthlyActivity(): Observable<MonthlyActivity[]> {
    return this.http.get<MonthlyActivity[]>(`${this.apiUrl}/monthly-activity`);
  }
}