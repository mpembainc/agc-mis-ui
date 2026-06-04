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

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

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

          return throwError(() => error);
        }

        case 500: {
          return throwError(() => error);
        }

        default: {
          if (error != 'OK') {
            return throwError(() => error);
          }
          return of(errorMessage);
        }
      }
    })
  );
};
