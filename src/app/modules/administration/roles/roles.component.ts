import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { ActionButtonComponent } from '@shared/components/action-button/action-button.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { RolesService } from '../services/roles.service';
import { Role } from '../models/role.model';
import { SwalService } from '@shared/services/swal.service';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';
import { Router } from '@angular/router';
import { matDialogConfig } from '@shared/config';

@Component({
  selector: 'app-roles',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DataTableComponent,
    ActionButtonComponent,
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private dialog = inject(MatDialog);
  private swalService = inject(SwalService);
  private router = inject(Router);

  @ViewChild('systemTpl', { static: true }) systemTpl!: TemplateRef<any>;
  @ViewChild('permissionsCountTpl', { static: true }) permissionsCountTpl!: TemplateRef<any>;

  roles: Role[] = [];
  loading = signal(false);
  searchText = '';

  columns: TableColumn[] = [
    { key: 'display_name', label: 'Role Name', type: 'text' },
    { key: 'name', label: 'Code Name (Slug)', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'permissions_count', label: 'Permissions Count' },
    { key: 'is_system', label: 'Type' },
  ];

  actionMenuItems: ActionMenuItem<Role>[] = [
    {
      label: 'Edit Role Details',
      icon: 'edit',
      color: 'primary',
      action: (row) => this.onEdit(row),
    },
    {
      label: 'Configure Permissions',
      icon: 'shield',
      color: 'accent',
      action: (row) => this.onConfigurePermissions(row),
    },
    {
      label: 'Delete Role',
      icon: 'delete',
      color: 'warn',
      hidden: (row: Role) => row.is_system,
      action: (row) => this.onDelete(row),
    },
  ];

  RoleDialog = RoleDialogComponent;
  matDialogConfig: MatDialogConfig = {
    ...matDialogConfig,
    position: {
      top: '25vh'
    },
    width: '800px',
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.rolesService.getRoles(this.searchText).subscribe({
      next: (res) => {
        this.roles = res.data;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load user roles.');
      },
    });
  }

  onSearch(search: string): void {
    this.searchText = search;
    this.loadRoles();
  }

  onEdit(role: Role): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      ...this.matDialogConfig,
      width: '800px',
      data: { role },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRoles();
      }
    });
  }

  onDelete(role: Role): void {
    this.swalService
      .confirm(
        `Are you sure you want to delete the role "${role.display_name}"? This action cannot be undone.`,
        'Delete Role',
        'Delete'
      )
      .then((res) => {
        if (res.isConfirmed) {
          this.loading.set(true);
          this.rolesService.deleteRole(role.id).subscribe({
            next: () => {
              this.swalService.success('Role deleted successfully.');
              this.loadRoles();
            },
            error: (err) => {
              this.loading.set(false);
              const msg = err?.error?.message || err?.message || 'Failed to delete role.';
              this.swalService.error(msg);
            },
          });
        }
      });
  }

  onConfigurePermissions(role: Role): void {
    this.router.navigate(['/administration/roles', role.id, 'permissions']);
  }

  onDialogClosed(result: any): void {
    if (result) {
      this.loadRoles();
    }
  }
}
