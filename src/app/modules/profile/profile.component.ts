import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SwalService } from '@shared/services/swal.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { UsersService } from '../administration/services/users.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private swalService = inject(SwalService);

  activeTab = 'profile';
  loading = signal(false);
  submittingInfo = signal(false);
  submittingPassword = signal(false);

  profileData: any = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.fetchProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    });

    this.passwordForm = this.fb.group(
      {
        new_password: ['', [Validators.required, Validators.minLength(8), this.passwordComplexityValidator()]],
        confirm_password: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  fetchProfile(): void {
    this.loading.set(true);
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.profileData = res.data;
        this.profileForm.patchValue({
          name: this.profileData.name,
          email: this.profileData.email,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load user profile information.');
      },
    });
  }

  onSubmitInfo(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.submittingInfo.set(true);
    const formVal = this.profileForm.value;

    this.usersService.updateUser(this.profileData.id, {
      name: formVal.name,
      email: formVal.email,
    }).subscribe({
      next: () => {
        this.submittingInfo.set(false);
        this.swalService.success('Profile details updated successfully.');
        
        // Sync local storage and reactive header
        this.authService.updateCurrentUserLocal({
          name: formVal.name,
          email: formVal.email,
        });

        // Update active profileData representation
        this.profileData.name = formVal.name;
        this.profileData.email = formVal.email;
      },
      error: (err) => {
        this.submittingInfo.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to update profile details.';
        this.swalService.error(msg);
      },
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.submittingPassword.set(true);
    const formVal = this.passwordForm.value;

    this.usersService.updateUser(this.profileData.id, {
      password: formVal.new_password,
    }).subscribe({
      next: () => {
        this.submittingPassword.set(false);
        this.swalService.success('Password updated successfully.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.submittingPassword.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to update password.';
        this.swalService.error(msg);
      },
    });
  }

  getInitials(): string {
    if (!this.profileData?.name) return 'U';
    return this.profileData.name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  groupedPermissions(): { key: string; values: string[] }[] {
    if (!this.profileData?.permissions) return [];
    
    const groups: Record<string, string[]> = {};
    this.profileData.permissions.forEach((perm: string) => {
      const parts = perm.split('.');
      const groupName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'General';
      const actionName = parts[1] ? parts[1].replace('_', ' ') : perm;
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(actionName);
    });

    return Object.keys(groups).map((key) => ({
      key,
      values: groups[key],
    }));
  }

  private passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val) return null;
      const hasUppercase = /[A-Z]/.test(val);
      const hasLowercase = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const valid = hasUppercase && hasLowercase && hasNumber;
      return valid ? null : { passwordComplexity: true };
    };
  }

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('new_password')?.value;
    const confirm = form.get('confirm_password')?.value;
    if (password && confirm && password !== confirm) {
      form.get('confirm_password')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }
}
