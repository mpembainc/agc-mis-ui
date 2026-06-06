import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from './roles.service';

@Injectable({
  providedIn: 'root',
})
export class LookupsService {
  private http = inject(HttpClient);
  private readonly setupBaseUrl = `${environment.apiUrl}/setup`;

  getItems(resource: string, search?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ApiResponse<any[]>>(`${this.setupBaseUrl}/${resource}`, { params });
  }

  getItem(resource: string, id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.setupBaseUrl}/${resource}/${id}`);
  }

  createItem(resource: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.setupBaseUrl}/${resource}`, payload);
  }

  updateItem(resource: string, id: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.setupBaseUrl}/${resource}/${id}`, payload);
  }

  deleteItem(resource: string, id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.setupBaseUrl}/${resource}/${id}`);
  }
}
