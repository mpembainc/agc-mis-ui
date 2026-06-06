import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '../models/user.model';
import { ApiResponse } from './roles.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
  }): Observable<ApiResponse<{
    data: User[];
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
      if (params.is_active !== undefined) {
        httpParams = httpParams.set('is_active', params.is_active.toString());
      }
    }
    return this.http.get<ApiResponse<any>>(this.baseUrl, { params: httpParams });
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
  }

  createUser(user: {
    name: string;
    email: string;
    password?: string;
    is_active: boolean;
    role_ids?: string[];
  }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, user);
  }

  updateUser(
    id: string,
    user: {
      name?: string;
      email?: string;
      password?: string;
      is_active?: boolean;
      role_ids?: string[];
    }
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  syncRoles(id: string, roleIds: string[]): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/${id}/roles`, {
      role_ids: roleIds,
    });
  }
}
