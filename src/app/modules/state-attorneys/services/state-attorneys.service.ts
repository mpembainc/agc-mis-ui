import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { StateAttorney, Mda, Grade, LegalSpecialisation } from '../models/state-attorney.model';

export interface PaginatedResponse<T> {
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class StateAttorneysService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/state-attorneys`;
  private readonly setupUrl = `${environment.apiUrl}/setup`;

  getAttorneys(filters: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    gender?: string;
    mda_id?: string;
  } = {}): Observable<PaginatedResponse<StateAttorney>> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.gender) params = params.set('gender', filters.gender);
    if (filters.mda_id) params = params.set('mda_id', filters.mda_id);

    return this.http.get<PaginatedResponse<StateAttorney>>(this.baseUrl, { params });
  }

  getAttorney(id: string): Observable<ApiResponse<StateAttorney>> {
    return this.http.get<ApiResponse<StateAttorney>>(`${this.baseUrl}/${id}`);
  }

  createAttorney(data: Partial<StateAttorney>): Observable<ApiResponse<StateAttorney>> {
    return this.http.post<ApiResponse<StateAttorney>>(this.baseUrl, data);
  }

  updateAttorney(id: string, data: Partial<StateAttorney>): Observable<ApiResponse<StateAttorney>> {
    return this.http.put<ApiResponse<StateAttorney>>(`${this.baseUrl}/${id}`, data);
  }

  deleteAttorney(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  // ── Lookup Data Fetchers ──
  getMdas(): Observable<ApiResponse<Mda[]>> {
    return this.http.get<ApiResponse<Mda[]>>(`${this.setupUrl}/mdas`);
  }

  getGrades(): Observable<ApiResponse<Grade[]>> {
    return this.http.get<ApiResponse<Grade[]>>(`${this.setupUrl}/grades`);
  }

  getSpecialisations(): Observable<ApiResponse<LegalSpecialisation[]>> {
    return this.http.get<ApiResponse<LegalSpecialisation[]>>(`${this.setupUrl}/legal-specialisations`);
  }
}
