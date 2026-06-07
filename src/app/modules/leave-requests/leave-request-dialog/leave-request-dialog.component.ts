import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { LeaveRequestsService } from '../services/leave-requests.service';
import { StateAttorneysService } from '@modules/state-attorneys/services/state-attorneys.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { SwalService } from '@shared/services/swal.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-leave-request-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatDatepickerModule,
    DialogLayoutComponent,
    MatProgressBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './leave-request-dialog.component.html',
  styleUrls: ['./leave-request-dialog.component.scss'],
})
export class LeaveRequestDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveRequestsService = inject(LeaveRequestsService);
  private stateAttorneysService = inject(StateAttorneysService);
  private authService = inject(AuthService);
  private swalService = inject(SwalService);

  form!: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  
  isAdmin = false;
  attorneys: any[] = [];
  resolvedAttorneyId: string | null = null;
  resolvedAttorneyName: string = '';

  leaveTypes = [
    { label: 'Annual Leave', value: 'annual' },
    { label: 'Sick Leave', value: 'sick' },
    { label: 'Maternity Leave', value: 'maternity' },
    { label: 'Paternity Leave', value: 'paternity' },
    { label: 'Compassionate Leave', value: 'compassionate' },
    { label: 'Study Leave', value: 'study' },
    { label: 'Unpaid Leave', value: 'unpaid' },
  ];

  constructor(
    public dialogRef: MatDialogRef<LeaveRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.isAdmin = currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('super-admin');

    this.initForm();
    this.setupDateListeners();
    this.loadContext();
  }

  initForm(): void {
    this.form = this.fb.group({
      attorney_id: ['', [Validators.required]],
      leave_type: ['annual', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      total_days: [{ value: 0, disabled: true }],
      reason: ['', [Validators.maxLength(500)]],
    });
  }

  setupDateListeners(): void {
    this.form.get('start_date')?.valueChanges.subscribe(() => this.calculateDays());
    this.form.get('end_date')?.valueChanges.subscribe(() => this.calculateDays());
  }

  calculateDays(): void {
    const start = this.form.get('start_date')?.value;
    const end = this.form.get('end_date')?.value;
    if (start && end) {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      if (endTime >= startTime) {
        const diffTime = Math.abs(endTime - startTime);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        this.form.get('total_days')?.setValue(diffDays);
      } else {
        this.form.get('total_days')?.setValue(0);
      }
    } else {
      this.form.get('total_days')?.setValue(0);
    }
  }

  loadContext(): void {
    this.loading.set(true);
    const currentUser = this.authService.getUser();

    if (this.isAdmin) {
      // If admin, load all attorneys so they can select
      this.stateAttorneysService.getAttorneys({ per_page: 100, status: 'active' }).subscribe({
        next: (res) => {
          this.attorneys = res.data.data || [];
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.swalService.error('Failed to load active state attorneys.');
        }
      });
    } else {
      // If regular user, resolve their attorney record using search with email
      this.stateAttorneysService.getAttorneys({ search: currentUser.email }).subscribe({
        next: (res) => {
          const list = res.data.data || [];
          const matched = list.find(a => a.email?.toLowerCase() === currentUser.email?.toLowerCase());
          
          if (matched) {
            this.resolvedAttorneyId = matched.id;
            this.resolvedAttorneyName = matched.full_name;
            this.form.get('attorney_id')?.setValue(matched.id);
          } else {
            this.swalService.error('Your user account is not registered as a State Attorney. Cannot submit leave request.');
            this.dialogRef.close();
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.swalService.error('Failed to resolve your attorney profile.');
          this.dialogRef.close();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const start = new Date(this.form.get('start_date')?.value);
    const end = new Date(this.form.get('end_date')?.value);
    if (end < start) {
      this.swalService.error('End Date cannot be before Start Date.');
      return;
    }

    this.submitting.set(true);
    const formVal = this.form.getRawValue();

    // Format dates to YYYY-MM-DD
    const formatDateStr = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const payload = {
      attorney_id: formVal.attorney_id,
      leave_type: formVal.leave_type,
      start_date: formatDateStr(start),
      end_date: formatDateStr(end),
      total_days: formVal.total_days,
      reason: formVal.reason || null,
    };

    this.leaveRequestsService.createLeaveRequest(payload as any).subscribe({
      next: () => {
        this.submitting.set(false);
        this.swalService.success('Leave request submitted successfully.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to submit leave request.';
        this.swalService.error(msg);
      }
    });
  }
}
