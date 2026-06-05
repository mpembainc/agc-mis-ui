import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RolesService } from '../../services/roles.service';
import { Role, Permission } from '../../models/role.model';
import { SwalService } from '@shared/services/swal.service';

@Component({
  selector: 'app-role-permissions',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss'],
})
export class RolePermissionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rolesService = inject(RolesService);
  private swalService = inject(SwalService);

  role: Role | null = null;
  roleId: string | null = null;

  loading = signal(false);
  submitting = signal(false);

  allPermissions: Permission[] = [];
  groupedPermissions: { [module: string]: Permission[] } = {};
  selectedPermissionIds = new Set<string>();

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id');
    if (this.roleId) {
      this.loadPermissionsAndRole(this.roleId);
    } else {
      this.swalService.error('Invalid Role ID.');
      this.router.navigate(['/administration/roles']);
    }
  }

  loadPermissionsAndRole(id: string): void {
    this.loading.set(true);
    this.rolesService.getPermissions().subscribe({
      next: (permRes) => {
        this.allPermissions = permRes.data;
        this.groupPermissions();

        this.rolesService.getRole(id).subscribe({
          next: (roleRes) => {
            this.role = roleRes.data;
            this.selectedPermissionIds.clear();
            if (this.role.permissions) {
              this.role.permissions.forEach((perm) => {
                this.selectedPermissionIds.add(perm.id);
              });
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            const msg = err?.error?.message || err?.message || 'Failed to load role details.';
            this.swalService.error(msg);
            this.router.navigate(['/administration/roles']);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.swalService.error('Failed to load permissions list.');
        this.router.navigate(['/administration/roles']);
      },
    });
  }

  groupPermissions(): void {
    this.groupedPermissions = {};
    this.allPermissions.forEach((permission) => {
      const moduleName = permission.module || 'other';
      if (!this.groupedPermissions[moduleName]) {
        this.groupedPermissions[moduleName] = [];
      }
      this.groupedPermissions[moduleName].push(permission);
    });
  }

  togglePermission(id: string): void {
    if (this.selectedPermissionIds.has(id)) {
      this.selectedPermissionIds.delete(id);
    } else {
      this.selectedPermissionIds.add(id);
    }
  }

  isPermissionSelected(id: string): boolean {
    return this.selectedPermissionIds.has(id);
  }

  isModuleAllSelected(moduleName: string): boolean {
    const permissions = this.groupedPermissions[moduleName] || [];
    if (permissions.length === 0) return false;
    return permissions.every((p) => this.selectedPermissionIds.has(p.id));
  }

  isModuleSomeSelected(moduleName: string): boolean {
    const permissions = this.groupedPermissions[moduleName] || [];
    if (permissions.length === 0) return false;
    const selectedCount = permissions.filter((p) => this.selectedPermissionIds.has(p.id)).length;
    return selectedCount > 0 && selectedCount < permissions.length;
  }

  toggleModulePermissions(moduleName: string, checked: boolean): void {
    const permissions = this.groupedPermissions[moduleName] || [];
    permissions.forEach((p) => {
      if (checked) {
        this.selectedPermissionIds.add(p.id);
      } else {
        this.selectedPermissionIds.delete(p.id);
      }
    });
  }

  isAllSelected(): boolean {
    if (this.allPermissions.length === 0) return false;
    return this.selectedPermissionIds.size === this.allPermissions.length;
  }

  isSomeSelected(): boolean {
    if (this.allPermissions.length === 0) return false;
    return this.selectedPermissionIds.size > 0 && this.selectedPermissionIds.size < this.allPermissions.length;
  }

  toggleAllPermissions(checked: boolean): void {
    if (checked) {
      this.allPermissions.forEach((p) => this.selectedPermissionIds.add(p.id));
    } else {
      this.selectedPermissionIds.clear();
    }
  }

  onSave(): void {
    if (!this.roleId) return;

    this.submitting.set(true);
    const permissionIds = Array.from(this.selectedPermissionIds);

    this.rolesService.syncPermissions(this.roleId, permissionIds).subscribe({
      next: () => {
        this.submitting.set(false);
        this.swalService.success('Permissions updated successfully.');
        this.router.navigate(['/administration/roles']);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to update permissions.';
        this.swalService.error(msg);
      },
    });
  }

  formatModuleName(module: string): string {
    return module
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatPermissionAction(name: string): string {
    const parts = name.split('.');
    if (parts.length > 1) {
      const action = parts[parts.length - 1];
      return action.charAt(0).toUpperCase() + action.slice(1);
    }
    return name;
  }
}
