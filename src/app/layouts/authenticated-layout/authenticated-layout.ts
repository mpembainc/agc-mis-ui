import { Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';

import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatLine } from '@angular/material/core';
import { MenusService } from '@shared/services/menus.service';
import { SwalService } from '@shared/services/swal.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'authenticated-layout',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatIcon,
    MatExpansionModule,
    RouterModule,
    MatListModule,
    MatMenuModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    MatLine,
  ],
  templateUrl: './authenticated-layout.html',
  styleUrls: ['./authenticated-layout.scss'],
})
export class AuthenticatedLayout implements OnDestroy {
  private menuService = inject(MenusService);
  private authService = inject(AuthService);
  private swalService = inject(SwalService);
  private permissionsService = inject(NgxPermissionsService);

  currentUser = this.authService.getUser();

  expandedMenuIndex: number | null = null;
  menuItems = this.menuService.getMenuItems();
  protected readonly isMobile = signal(true);
  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  protected permissions: Array<any> = [];

  constructor() {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);

    if (this.currentUser && this.currentUser.permissions) {
      this.permissionsService.loadPermissions(this.currentUser.permissions);
    }
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  async logout() {
    const res = await this.swalService.confirm('Are you sure you want to sign out?', 'Logout', 'Yes, Logout');
    if (res.isConfirmed) {
      this.authService.logout();
    }
  }
}
