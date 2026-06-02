import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment';

export interface ResetPasswordRequest {
  token: string,
  password: string
}

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private readonly BASE_URL = `${environment.apiUrl}/forgot-password`;

  constructor(private http: HttpClient) {
  }

  sendResetLink(dto: {email: string }) {
    return this.http.post<{success: boolean}>(`${this.BASE_URL}`, dto)
  }

  resetPassword(request: ResetPasswordRequest) {
    return this.http.post<{status: boolean, message: string}>(`${this.BASE_URL}/reset`, request);
  }
}
