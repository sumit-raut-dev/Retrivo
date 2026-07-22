import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateClaim, ClaimSuccess, ItemClaim } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class Claims {
  private apiUrl = `${environment.apiUrl}/claims`;

  constructor(private http: HttpClient) { }

  submitClaim(dto: CreateClaim): Observable<ClaimSuccess> {
    return this.http.post<ClaimSuccess>(this.apiUrl, dto);
  }

  getClaimsForItem(itemId: number): Observable<ItemClaim[]> {
    return this.http.get<ItemClaim[]>(`${this.apiUrl}/item/${itemId}`);
  }
}