import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuditLog } from '../models/audit-log.model';
import { ApiResponse } from './roles.service';

@Injectable({
  providedIn: 'root',
})
export class AuditLogsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/audit-logs`;

  getAuditLogs(params?: {
    page?: number;
    per_page?: number;
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
  }): Observable<ApiResponse<{
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.per_page) {
        httpParams = httpParams.set('per_page', params.per_page.toString());
      }
      if (params.entity_type) {
        httpParams = httpParams.set('entity_type', params.entity_type);
      }
      if (params.entity_id) {
        httpParams = httpParams.set('entity_id', params.entity_id);
      }
      if (params.user_id) {
        httpParams = httpParams.set('user_id', params.user_id);
      }
      if (params.action) {
        httpParams = httpParams.set('action', params.action);
      }
      if (params.date_from) {
        httpParams = httpParams.set('date_from', params.date_from);
      }
      if (params.date_to) {
        httpParams = httpParams.set('date_to', params.date_to);
      }
    }
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params: httpParams });
  }

  getAuditLog(id: string): Observable<ApiResponse<AuditLog>> {
    return this.http.get<ApiResponse<AuditLog>>(`${this.baseUrl}/${id}`);
  }
}
