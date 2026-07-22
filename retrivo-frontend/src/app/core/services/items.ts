import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Item, PublicStats, AdminItem , MyItem} from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class Items {
  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) { }

  getItems(params?: { categoryId?: number; itemType?: string; search?: string }): Observable<Item[]> {
    let httpParams = new HttpParams();
    if (params?.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params?.itemType) httpParams = httpParams.set('itemType', params.itemType);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return this.http.get<Item[]>(this.apiUrl, { params: httpParams });
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  getPublicStats(): Observable<PublicStats> {
    return this.http.get<PublicStats>(`${this.apiUrl}/public-stats`);
  }

  createItem(dto: { title: string; description: string; categoryId: number; location: string; itemType: string; photoUrl?: string }): Observable<{ message: string; itemId: number }> {
    return this.http.post<{ message: string; itemId: number }>(this.apiUrl, dto);
  }

  getAllItemsAdmin(): Observable<AdminItem[]> {
    return this.http.get<AdminItem[]>(`${this.apiUrl}/admin/all`);
  }

  deleteItem(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/${id}`);
  }

  getMyItems(): Observable<MyItem[]> {
    return this.http.get<MyItem[]>(`${this.apiUrl}/my-items`);
  }

  resolveItem(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/resolve`, {});
  }

  reopenItem(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/reopen`, {});
  }
}