import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  constructor(private authService: AuthService) {}

  hasPermission(permissions: string | string[]) {
    const userPermissions = this.authService.getUser().permissions;
    if (permissions instanceof Array) {
      let permitted = false;
      for (let index = 0; index < permissions.length; index++) {
        const permission = permissions[index];
        if (userPermissions.includes(permission)) {
          permitted = true;
          break;
        }
        permitted = false;
      }
      return permitted;
    } else {
      return userPermissions.includes(permissions);
    }
  }
}
