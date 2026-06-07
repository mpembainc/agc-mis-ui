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
import { NotificationsService } from '@shared/services/notifications.service';
import { DatePipe } from '@angular/common';
import {
  LucideBell,
  LucideCheck,
  LucideTrash2,
  LucideInfo,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideXCircle,
  LucideArrowRight,
  LucideInbox,
} from '@lucide/angular';

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
    MatToolbarModule,
    MatLine,
    DatePipe,
    LucideBell,
    LucideCheck,
    LucideTrash2,
    LucideInfo,
    LucideCheckCircle2,
    LucideAlertTriangle,
    LucideXCircle,
    LucideArrowRight,
    LucideInbox,
  ],
  templateUrl: './authenticated-layout.html',
  styleUrls: ['./authenticated-layout.scss'],
})
export class AuthenticatedLayout implements OnDestroy {
  private menuService = inject(MenusService);
  private authService = inject(AuthService);
  private swalService = inject(SwalService);
  private permissionsService = inject(NgxPermissionsService);
  protected notificationsService = inject(NotificationsService);

  get currentUser() {
    return this.authService.currentUserSignal();
  }

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

    if (this.currentUser) {
      this.notificationsService.loadNotifications().subscribe();
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

  markAsRead(id: string, event: Event) {
    event.stopPropagation();
    this.notificationsService.markAsRead(id).subscribe();
  }

  deleteNotification(id: string, event: Event) {
    event.stopPropagation();
    this.notificationsService.deleteNotification(id).subscribe();
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notificationsService.markAllAsRead().subscribe();
  }

  createMockNotification() {
    if (!this.currentUser) return;
    const mockTypes = ['info', 'success', 'warning', 'error', 'workflow'];
    const randomType = mockTypes[Math.floor(Math.random() * mockTypes.length)];
    
    let title = 'Notification';
    let body = 'This is a test notification.';
    let link = '/dashboard';

    if (randomType === 'success') {
      title = 'Contract Approved';
      body = 'The contract for Project Alpha has been approved by the legal director.';
      link = '/contracts';
    } else if (randomType === 'warning') {
      title = 'Milestone Impending';
      body = 'Milestone "Initial Draft" is due in 3 days.';
      link = '/contracts';
    } else if (randomType === 'error') {
      title = 'Approval Rejected';
      body = 'Your leave request has been rejected by the HR manager.';
      link = '/leave-requests';
    } else if (randomType === 'workflow') {
      title = 'New Task Assigned';
      body = 'You have a new contract review workflow task assigned to you.';
      link = '/workflows/my-tasks';
    } else {
      title = 'System Update';
      body = 'The AGC Management Information System will undergo maintenance at 10:00 PM.';
    }

    this.notificationsService.createNotification({
      title,
      body,
      link,
      notification_type: randomType,
      user_id: this.currentUser.id
    }).subscribe();
  }
}
