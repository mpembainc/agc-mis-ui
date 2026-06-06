import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, TableColumn, TableFilter } from '@shared/components/data-table/data-table.component';
import { ActionButtonComponent } from '@shared/components/action-button/action-button.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { UsersService } from '../services/users.service';
import { User } from '../models/user.model';
import { SwalService } from '@shared/services/swal.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { matDialogConfig } from '@shared/config';
import { AuthService } from '@modules/auth/services/auth.service';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DataTableComponent,
    ActionButtonComponent,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private dialog = inject(MatDialog);
  private swalService = inject(SwalService);
  private authService = inject(AuthService);

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('rolesTpl', { static: true }) rolesTpl!: TemplateRef<any>;

  users: User[] = [];
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchText = '';
  activeFilters: Record<string, any> = {};

  columns: TableColumn[] = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email Address', type: 'text' },
    { key: 'roles', label: 'Assigned Roles' },
    { key: 'is_active', label: 'Status' },
    { key: 'created_at', label: 'Registered Date', type: 'date', format: 'mediumDate' },
  ];

  filters: TableFilter[] = [
    {
      key: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active Only', value: 'true' },
        { label: 'Inactive Only', value: 'false' },
      ],
    },
  ];

  actionMenuItems: ActionMenuItem<User>[] = [
    {
      label: 'Edit User Details',
      icon: 'edit',
      color: 'primary',
      action: (row) => this.onEdit(row),
    },
    {
      label: 'Delete User',
      icon: 'delete',
      color: 'warn',
      hidden: (row: User) => {
        const currentUser = this.authService.getUser();
        return row.id === String(currentUser?.id);
      },
      action: (row) => this.onDelete(row),
    },
  ];

  UserDialog = UserDialogComponent;
  matDialogConfig: MatDialogConfig = {
    ...matDialogConfig,
    position: {
      top: '20vh',
    },
    width: '800px',
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    
    // Prepare query parameters
    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      search: this.searchText || undefined,
      is_active: this.activeFilters['is_active'] !== undefined ? this.activeFilters['is_active'] === 'true' : undefined,
    };

    this.usersService.getUsers(params).subscribe({
      next: (res) => {
        this.users = res.data.data;
        this.totalItems = res.data.total;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load user accounts.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSearch(search: string): void {
    this.searchText = search;
    this.pageIndex = 0;
    this.loadUsers();
  }

  onFilterChange(filters: Record<string, any>): void {
    const cleanFilters: Record<string, any> = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== '') {
        cleanFilters[key] = filters[key];
      }
    });

    this.activeFilters = cleanFilters;
    this.pageIndex = 0;
    this.loadUsers();
  }

  onEdit(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      ...this.matDialogConfig,
      data: { user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  onDelete(user: User): void {
    this.swalService
      .confirm(
        `Are you sure you want to delete the user account for "${user.name}"? This action cannot be undone.`,
        'Delete User Account',
        'Delete'
      )
      .then((res) => {
        if (res.isConfirmed) {
          this.loading.set(true);
          this.usersService.deleteUser(user.id).subscribe({
            next: () => {
              this.swalService.success('User account deleted successfully.');
              this.loadUsers();
            },
            error: (err) => {
              this.loading.set(false);
              const msg = err?.error?.message || err?.message || 'Failed to delete user account.';
              this.swalService.error(msg);
            },
          });
        }
      });
  }

  onDialogClosed(result: any): void {
    if (result) {
      this.loadUsers();
    }
  }
}
