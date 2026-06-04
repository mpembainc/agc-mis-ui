import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '../user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          const token = res.data.token;
          const user = res.data.user;

          localStorage.setItem('_agc_ta', token);
          localStorage.setItem('_agc_ud', btoa(JSON.stringify(user)));

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          window.location.replace(returnUrl);
        }
      })
    );
  }

  logout(returnUrl?: string): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        this.clearSession(returnUrl);
      },
      error: () => {
        // Even if the backend call fails, proceed with logging out locally
        this.clearSession(returnUrl);
      }
    });
  }

  private clearSession(returnUrl?: string): void {
    localStorage.removeItem('_agc_ta');
    localStorage.removeItem('_agc_ud');
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  clearUsrData() {
    localStorage.removeItem('_agc_ta');
    localStorage.removeItem('_agc_ud');
  }

  loggedIn(): boolean {
    return !!this.getAuthToken();
  }

  getAuthToken() {
    return localStorage.getItem('_agc_ta');
  }

  getUser(): User {
    const data = localStorage.getItem('_agc_ud');
    if (!data) {
      return { id: 0, name: '', email: '', mda_id: null, roles: [], permissions: [] } as User;
    }
    try {
      const user = JSON.parse(atob(data));
      if (user && user.roles) {
        user.roles = user.roles.map((r: any) => typeof r === 'string' ? r : r.name || r.display_name || '');
      }
      return user;
    } catch {
      return { id: 0, name: '', email: '', mda_id: null, roles: [], permissions: [] } as User;
    }
  }
}
