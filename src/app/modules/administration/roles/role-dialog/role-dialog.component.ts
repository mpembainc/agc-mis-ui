import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/role.model';
import { SwalService } from '@shared/services/swal.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-role-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    DialogLayoutComponent,
    MatProgressBarModule,
  ],
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss'],
})
export class RoleDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);
  private swalService = inject(SwalService);

  form!: FormGroup;
  isEditMode = false;
  roleId: string | null = null;

  loading = signal(false);
  submitting = signal(false);

  constructor(
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role?: Role }
  ) {
    if (data?.role) {
      this.isEditMode = true;
      this.roleId = data.role.id;
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode && this.roleId) {
      this.loadRoleDetails(this.roleId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      name: [
        { value: '', disabled: this.isEditMode },
        [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-z0-9-_]+$/)],
      ],
      display_name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });
  }

  loadRoleDetails(id: string): void {
    this.loading.set(true);
    this.rolesService.getRole(id).subscribe({
      next: (res) => {
        const role = res.data;
        this.form.patchValue({
          name: role.name,
          display_name: role.display_name,
          description: role.description,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.swalService.error('Failed to load role details.');
        this.dialogRef.close();
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formVal = this.form.getRawValue();
    const data = {
      name: formVal.name,
      display_name: formVal.display_name,
      description: formVal.description || null,
    };

    const request = this.isEditMode && this.roleId
      ? this.rolesService.updateRole(this.roleId, data)
      : this.rolesService.createRole(data);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.swalService.success(`Role ${this.isEditMode ? 'updated' : 'created'} successfully.`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Operation failed.';
        this.swalService.error(msg);
      },
    });
  }
}
