import { Injectable } from '@angular/core';
import { MenuItem } from '@shared/types/menu-item';

@Injectable({
  providedIn: 'root',
})
export class MenusService {
  getMenuItems(): MenuItem[] {
    const allMenus: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
      },
    ];

    return allMenus;
  }
}
