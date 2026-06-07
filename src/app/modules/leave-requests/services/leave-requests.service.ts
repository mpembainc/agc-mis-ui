import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { LeaveRequest } from '../models/leave-request.model';
import { ApiResponse } from '@modules/workflows/services/workflows.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveRequestsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/leave-requests`;

  getLeaveRequests(params?: {
    page?: number;
    per_page?: number;
    attorney_id?: string;
    status?: string;
    leave_type?: string;
  }): Observable<ApiResponse<{
    data: LeaveRequest[];
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
      if (params.attorney_id) {
        httpParams = httpParams.set('attorney_id', params.attorney_id);
      }
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.leave_type) {
        httpParams = httpParams.set('leave_type', params.leave_type);
      }
    }
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params: httpParams });
  }

  getLeaveRequest(id: string): Observable<ApiResponse<LeaveRequest>> {
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${id}`);
  }

  createLeaveRequest(data: LeaveRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.post<ApiResponse<LeaveRequest>>(this.baseUrl, data);
  }

  updateLeaveRequest(id: string, data: Partial<LeaveRequest>): Observable<ApiResponse<LeaveRequest>> {
    return this.http.put<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${id}`, data);
  }

  deleteLeaveRequest(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
