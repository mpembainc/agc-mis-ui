import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Role, Permission } from '../models/role.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;
  private readonly permissionsUrl = `${environment.apiUrl}/permissions`;

  getRoles(search?: string): Observable<ApiResponse<Role[]>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ApiResponse<Role[]>>(this.baseUrl, { params });
  }

  getRole(id: string): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/${id}`);
  }

  createRole(role: {
    name: string;
    display_name: string;
    description?: string | null;
    permission_ids?: string[];
  }): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.baseUrl, role);
  }

  updateRole(
    id: string,
    role: {
      display_name?: string;
      description?: string | null;
      permission_ids?: string[];
    }
  ): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${id}`, role);
  }

  deleteRole(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  syncPermissions(id: string, permissionIds: string[]): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/${id}/permissions`, {
      permission_ids: permissionIds,
    });
  }

  getPermissions(search?: string, module?: string): Observable<ApiResponse<Permission[]>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (module) params = params.set('module', module);
    return this.http.get<ApiResponse<Permission[]>>(this.permissionsUrl, { params });
  }
}
