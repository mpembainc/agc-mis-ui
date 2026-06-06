import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { UsersService } from '../../services/users.service';
import { RolesService } from '../../services/roles.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { SwalService } from '@shared/services/swal.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-user-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    DialogLayoutComponent,
    MatProgressBarModule,
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private rolesService = inject(RolesService);
  private swalService = inject(SwalService);

  form!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  roles: Role[] = [];

  loading = signal(false);
  submitting = signal(false);

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    if (data?.user) {
      this.isEditMode = true;
      this.userId = data.user.id;
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    if (this.isEditMode && this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [this.passwordValidator(this.isEditMode)]],
      is_active: [true],
      role_ids: [[], [Validators.required]],
    });
  }

  loadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (res) => {
        this.roles = res.data;
      },
      error: () => {
        this.swalService.error('Failed to load available roles.');
      },
    });
  }

  loadUserDetails(id: string): void {
    this.loading.set(true);
    this.usersService.getUser(id).subscribe({
      next: (res) => {
        const user = res.data;
        const currentRoleIds = user.roles?.map((r) => r.id) || [];
        this.form.patchValue({
          name: user.name,
          email: user.email,
          is_active: user.is_active,
          role_ids: currentRoleIds,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load user details.');
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
    
    // Prepare payload
    const payload: any = {
      name: formVal.name,
      email: formVal.email,
      is_active: formVal.is_active,
      role_ids: formVal.role_ids,
    };

    if (formVal.password) {
      payload.password = formVal.password;
    }

    const request = this.isEditMode && this.userId
      ? this.usersService.updateUser(this.userId, payload)
      : this.usersService.createUser(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.swalService.success(`User ${this.isEditMode ? 'updated' : 'created'} successfully.`);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Operation failed.';
        this.swalService.error(msg);
      },
    });
  }

  private passwordValidator(isEdit: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val) {
        return isEdit ? null : { required: true };
      }
      if (val.length < 8) {
        return { minlength: true };
      }
      const hasUppercase = /[A-Z]/.test(val);
      const hasLowercase = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const valid = hasUppercase && hasLowercase && hasNumber;
      return valid ? null : { passwordComplexity: true };
    };
  }
}
