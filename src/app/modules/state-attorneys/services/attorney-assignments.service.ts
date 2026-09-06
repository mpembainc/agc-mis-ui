import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AttorneyAssignment } from '../models/state-attorney.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedAssignments<T> {
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
export class AttorneyAssignmentsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/attorney-assignments`;
  private readonly contractsUrl = `${environment.apiUrl}/contracts`;

  getAssignments(filters: {
    attorney_id?: string;
    entity_type?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {}): Observable<PaginatedAssignments<AttorneyAssignment>> {
    let params = new HttpParams();
    if (filters.attorney_id) params = params.set('attorney_id', filters.attorney_id);
    if (filters.entity_type) params = params.set('entity_type', filters.entity_type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.per_page) params = params.set('per_page', filters.per_page.toString());

    return this.http.get<PaginatedAssignments<AttorneyAssignment>>(this.baseUrl, { params });
  }

  getAssignment(id: string): Observable<ApiResponse<AttorneyAssignment>> {
    return this.http.get<ApiResponse<AttorneyAssignment>>(`${this.baseUrl}/${id}`);
  }

  createAssignment(data: Partial<AttorneyAssignment>): Observable<ApiResponse<AttorneyAssignment>> {
    return this.http.post<ApiResponse<AttorneyAssignment>>(this.baseUrl, data);
  }

  updateAssignment(id: string, data: Partial<AttorneyAssignment>): Observable<ApiResponse<AttorneyAssignment>> {
    return this.http.put<ApiResponse<AttorneyAssignment>>(`${this.baseUrl}/${id}`, data);
  }

  deleteAssignment(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  getAvailableContracts(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.contractsUrl, {
      params: new HttpParams().set('per_page', '100'),
    });
  }
}
