import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, delay, tap } from 'rxjs';
import { User } from '../user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  login(credentials: any) {
    return of(true).pipe(
      delay(1000),
      tap(() => {
        localStorage.setItem('_ta', 'mock-token');
        const mockUser = {
          name: 'Nahla Masoud Abdul',
          email: 'nahla.abdul@agc.go.tz',
          role: 'System Administrator'
        };
        localStorage.setItem('_ud', btoa(JSON.stringify(mockUser)));
        
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        window.location.replace(returnUrl);
      })
    );
  }

  logout(returnUrl?: string): void {
    localStorage.clear();
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
  }

  clearUsrData() {
    localStorage.removeItem('_ta');
  }

  loggedIn(): boolean {
    return !!this.getAuthToken();
  }

  getAuthToken() {
    const token = localStorage.getItem('_ta');
    return token;
  }

  getAnToken() {
    const token = localStorage.getItem('_nt');
    return token;
  }

  getRefreshToken() {
    const token = localStorage.getItem('_ur');
    return token;
  }

  getUser(): User {
    const data = atob(localStorage.getItem('_ud')!);
    return JSON.parse(data);
  }
}
