import { inject } from '@angular/core';
import { HttpRequest, HttpEvent, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services/auth.service';

export const appInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const addAuthToken = (req: HttpRequest<unknown>) => {
    const token = authService.getAuthToken();
    const ant = authService.getAnToken();

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        ant: `${ant}`
      },
    });
  };

  if (request.url.includes('auth/v1/o/dr')) {
    const token = authService.getAuthToken();
    const ant = authService.getAnToken();
    const rf = authService.getRefreshToken();

    return next(request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        ant: `${ant}`,
        tr: `${rf}`,
        "X-Frame-Options": "SAMEORIGIN"
      },
      reportProgress: true,
    }));
  }

  if (['api.ipify.org', 'auth/v1/o/', 'auth/v1/login'].some(url => request.url.includes(url))) {
    return next(request.clone({
      setHeaders: {
        'Accept': '*/*',
        "X-Frame-Options": "SAMEORIGIN"
      },
      reportProgress: true,
    }));
  }

  return next(addAuthToken(request)).pipe(
    catchError((error) => {
      const errorMessage =
        (error.error ? error.error.message : null) || error.statusText;

      switch (error.status) {
        case 401: {
          authService.clearUsrData();

          if (router.url !== '/login') {
            router.navigate(['/login'], {
              queryParams: { returnUrl: router.url }
            });
          }

          return throwError(() => errorMessage);
        }

        case 500: {
          return throwError(() => errorMessage);
        }

        default: {
          if (error != 'OK') {
            return throwError(() => errorMessage);
          }
          return of(errorMessage);
        }
      }
    })
  );
};
