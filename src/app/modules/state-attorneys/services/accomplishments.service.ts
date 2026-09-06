import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Accomplishment, AccomplishmentType, AccomplishmentStats } from '../models/state-attorney.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedAccomplishments<T> {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccomplishmentsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/accomplishments`;
  private readonly contractsUrl = `${environment.apiUrl}/contracts`;

  getAccomplishments(filters: {
    attorney_id?: string;
    type_id?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}): Observable<PaginatedAccomplishments<Accomplishment>> {
    let params = new HttpParams();
    if (filters.attorney_id) params = params.set('attorney_id', filters.attorney_id);
    if (filters.type_id) params = params.set('type_id', filters.type_id);
    if (filters.entity_type) params = params.set('entity_type', filters.entity_type);
    if (filters.start_date) params = params.set('start_date', filters.start_date);
    if (filters.end_date) params = params.set('end_date', filters.end_date);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.per_page) params = params.set('per_page', filters.per_page.toString());

    return this.http.get<PaginatedAccomplishments<Accomplishment>>(this.baseUrl, { params });
  }

  getAccomplishment(id: string): Observable<ApiResponse<Accomplishment>> {
    return this.http.get<ApiResponse<Accomplishment>>(`${this.baseUrl}/${id}`);
  }

  createAccomplishment(data: Partial<Accomplishment>): Observable<ApiResponse<Accomplishment>> {
    return this.http.post<ApiResponse<Accomplishment>>(this.baseUrl, data);
  }

  updateAccomplishment(id: string, data: Partial<Accomplishment>): Observable<ApiResponse<Accomplishment>> {
    return this.http.put<ApiResponse<Accomplishment>>(`${this.baseUrl}/${id}`, data);
  }

  deleteAccomplishment(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  getAccomplishmentTypes(): Observable<ApiResponse<AccomplishmentType[]>> {
    return this.http.get<ApiResponse<AccomplishmentType[]>>(`${this.baseUrl}/types`);
  }

  getAccomplishmentStats(attorneyId?: string): Observable<ApiResponse<AccomplishmentStats>> {
    let params = new HttpParams();
    if (attorneyId) {
      params = params.set('attorney_id', attorneyId);
    }
    return this.http.get<ApiResponse<AccomplishmentStats>>(`${this.baseUrl}/stats`, { params });
  }

  getAvailableContracts(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.contractsUrl, {
      params: new HttpParams().set('per_page', '100'),
    });
  }
}
