import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { SwalService } from '@shared/services/swal.service';
import { NotificationsService } from '@shared/services/notifications.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  LucideBell,
  LucideCheck,
  LucideTrash2,
  LucideInfo,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideXCircle,
  LucideInbox,
  LucideSearch,
  LucideCheckSquare,
  LucidePlus,
} from '@lucide/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatMenuModule,
    LucideBell,
    LucideCheck,
    LucideTrash2,
    LucideInfo,
    LucideCheckCircle2,
    LucideAlertTriangle,
    LucideXCircle,
    LucideInbox,
    LucideSearch,
    RouterLink,
    ButtonComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  protected readonly plusIcon = LucidePlus;
  protected readonly checkSquareIcon = LucideCheckSquare;
  protected readonly trashIcon = LucideTrash2;

  protected notificationsService = inject(NotificationsService);
  private swalService = inject(SwalService);
  private authService = inject(AuthService);

  // Loading state (using signals as mandated)
  loading = signal(false);

  // Search and Filter State
  activeFilter = signal<'all' | 'unread'>('all');
  searchQuery = signal('');

  // Computed signal for filtered notifications list
  filteredNotifications = computed(() => {
    let list = this.notificationsService.notifications();

    // 1. Filter by unread if active
    if (this.activeFilter() === 'unread') {
      list = list.filter((n) => !n.is_read);
    }

    // 2. Filter by search query (title or body)
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          (n.body && n.body.toLowerCase().includes(query))
      );
    }

    return list;
  });

  get currentUser() {
    return this.authService.currentUserSignal();
  }

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.loading.set(true);
    this.notificationsService.loadNotifications().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load notifications.');
      },
    });
  }

  markAsRead(id: string): void {
    this.notificationsService.markAsRead(id).subscribe({
      error: () => this.swalService.error('Failed to mark notification as read.'),
    });
  }

  deleteNotification(id: string): void {
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => this.swalService.success('Notification deleted successfully.'),
      error: () => this.swalService.error('Failed to delete notification.'),
    });
  }

  async markAllAsRead(): Promise<void> {
    const unreadCount = this.notificationsService.unreadCount();
    if (unreadCount === 0) return;

    this.loading.set(true);
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.loading.set(false);
        this.swalService.success('All notifications marked as read.');
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to mark all as read.');
      },
    });
  }

  async deleteAllNotifications(): Promise<void> {
    const count = this.notificationsService.notifications().length;
    if (count === 0) return;

    const confirm = await this.swalService.confirm(
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      'Delete All Notifications',
      'Yes, Delete All'
    );

    if (confirm.isConfirmed) {
      this.loading.set(true);
      this.notificationsService.deleteAllNotifications().subscribe({
        next: () => {
          this.loading.set(false);
          this.swalService.success('All notifications deleted successfully.');
        },
        error: () => {
          this.loading.set(false);
          this.swalService.error('Failed to delete all notifications.');
        },
      });
    }
  }

  createMockNotification(): void {
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

    this.loading.set(true);
    this.notificationsService.createNotification({
      title,
      body,
      link,
      notification_type: randomType,
      user_id: this.currentUser.id
    }).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}
