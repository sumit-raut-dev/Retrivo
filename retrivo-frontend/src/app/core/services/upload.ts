import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Upload {
  private apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; publicId: string }>(this.apiUrl, formData);
  }
}