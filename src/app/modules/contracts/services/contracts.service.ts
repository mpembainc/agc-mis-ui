import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@modules/administration/services/roles.service';
import { Contract, ContractDashboardData } from '../models/contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/contracts`;

  getDashboardMetrics(): Observable<ApiResponse<ContractDashboardData>> {
    return this.http.get<ApiResponse<ContractDashboardData>>(`${this.baseUrl}/dashboard`);
  }

  getContracts(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    mda_id?: string;
    strategic_only?: boolean;
  }): Observable<ApiResponse<{
    data: Contract[];
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
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.mda_id) {
        httpParams = httpParams.set('mda_id', params.mda_id);
      }
      if (params.strategic_only !== undefined) {
        httpParams = httpParams.set('strategic_only', params.strategic_only.toString());
      }
    }
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params: httpParams });
  }

  getContract(id: string): Observable<ApiResponse<Contract>> {
    return this.http.get<ApiResponse<Contract>>(`${this.baseUrl}/${id}`);
  }

  createContract(contract: Contract): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(this.baseUrl, contract);
  }

  updateContract(id: string, contract: Contract): Observable<ApiResponse<Contract>> {
    return this.http.put<ApiResponse<Contract>>(`${this.baseUrl}/${id}`, contract);
  }

  deleteContract(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
