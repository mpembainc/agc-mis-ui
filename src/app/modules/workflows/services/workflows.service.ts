import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { WorkflowInstance } from '../models/workflow.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkflowsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/workflow-instances`;

  getWorkflowInstances(params?: {
    page?: number;
    per_page?: number;
    entity_type?: string;
    current_state?: string;
  }): Observable<ApiResponse<{
    data: WorkflowInstance[];
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
      if (params.current_state) {
        httpParams = httpParams.set('current_state', params.current_state);
      }
    }
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params: httpParams });
  }

  getWorkflowInstance(id: string): Observable<ApiResponse<WorkflowInstance>> {
    return this.http.get<ApiResponse<WorkflowInstance>>(`${this.baseUrl}/${id}`);
  }

  updateWorkflowInstance(id: string, data: Partial<WorkflowInstance>): Observable<ApiResponse<WorkflowInstance>> {
    return this.http.put<ApiResponse<WorkflowInstance>>(`${this.baseUrl}/${id}`, data);
  }

  // --- Entity Fetch Helpers ---

  getContract(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/contracts/${id}`);
  }

  getLeaveRequest(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/leave-requests/${id}`);
  }

  // --- Workflow State Transitions ---

  transitionContract(id: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/contracts/${id}`, { status });
  }

  transitionLeaveRequest(id: string, status: string, remarks?: string): Observable<ApiResponse<any>> {
    const payload: any = { status };
    if (remarks !== undefined) {
      payload.approver_remarks = remarks;
    }
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/leave-requests/${id}`, payload);
  }
}
