import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { StateAttorneysService } from '../services/state-attorneys.service';
import { Mda, Grade } from '../models/state-attorney.model';
import { SwalService } from '@shared/services/swal.service';
import { SelectSearchComponent } from '@shared/components/select-search/select-search.component';

@Component({
  selector: 'app-attorney-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatDatepickerModule,
    SelectSearchComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './attorney-form.component.html',
  styleUrls: ['./attorney-form.component.scss'],
})
export class AttorneyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(StateAttorneysService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private swalService = inject(SwalService);

  form!: FormGroup;
  isEditMode = false;
  attorneyId: string | null = null;
  loading = signal(false);
  submitting = false;

  mdas: Mda[] = [];
  grades: Grade[] = [];
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18));

  genders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
  ];

  employmentTypes = [
    { label: 'Permanent', value: 'permanent' },
    { label: 'Contract', value: 'contract' },
    { label: 'Temporary', value: 'temporary' },
    { label: 'Secondment', value: 'secondment' },
  ];

  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'On Leave', value: 'on_leave' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Seconded', value: 'seconded' },
    { label: 'Resigned', value: 'resigned' },
    { label: 'Retired', value: 'retired' },
    { label: 'Deceased', value: 'deceased' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadLookups();
    this.checkRouteParams();
  }

  initForm(): void {
    this.form = this.fb.group({
      full_name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20)]],
      date_of_birth: [null, [this.minAgeValidator(18)]],
      zanid: ['', [Validators.maxLength(20)]],
      gender: [null],
      employment_type: [null],
      mda_id: [null],
      current_grade_id: [null],
      current_grade: [''],
      bio_summary: [''],
      status: ['active', [Validators.required]],
      is_active: [true],
    });

    // Automatically set current_grade string representation when current_grade_id changes
    this.form.get('current_grade_id')?.valueChanges.subscribe((gradeId) => {
      const grade = this.grades.find((g) => g.id === gradeId);
      if (grade) {
        this.form.get('current_grade')?.setValue(grade.grade_name, { emitEvent: false });
      }
    });
  }

  loadLookups(): void {
    this.service.getMdas().subscribe({
      next: (res) => {
        this.mdas = res.data;
      },
    });

    this.service.getGrades().subscribe({
      next: (res) => {
        this.grades = res.data;
        // Trigger grade change update if form value exists
        const currentGradeId = this.form.get('current_grade_id')?.value;
        if (currentGradeId) {
          const grade = this.grades.find((g) => g.id === currentGradeId);
          if (grade) {
            this.form.get('current_grade')?.setValue(grade.grade_name, { emitEvent: false });
          }
        }
      },
    });
  }

  checkRouteParams(): void {
    this.attorneyId = this.route.snapshot.paramMap.get('id');
    if (this.attorneyId) {
      this.isEditMode = true;
      this.loadAttorneyDetails(this.attorneyId);
    }
  }

  loadAttorneyDetails(id: string): void {
    this.loading.set(true);
    this.service.getAttorney(id).subscribe({
      next: (res) => {
        try {
          const attorney = res?.data;
          if (!attorney) {
            this.swalService.error('State Attorney not found.');
            this.router.navigate(['/state-attorneys']);
            return;
          }

          // Parse date of birth safely as a Date object for MatDatepicker
          let parsedDob: Date | null = null;
          if (attorney.date_of_birth) {
            const d = new Date(attorney.date_of_birth);
            if (!isNaN(d.getTime())) {
              parsedDob = d;
            }
          }

          this.form.patchValue({
            full_name: attorney.full_name || '',
            email: attorney.email || '',
            phone: attorney.phone || '',
            date_of_birth: parsedDob,
            zanid: attorney.zanid || '',
            gender: attorney.gender || null,
            employment_type: attorney.employment_type || null,
            mda_id: attorney.mda_id || null,
            current_grade_id: attorney.current_grade_id || null,
            current_grade: attorney.current_grade || '',
            bio_summary: attorney.bio_summary || '',
            status: attorney.status || 'active',
            is_active: attorney.is_active ?? true,
          });

          this.loading.set(false);
        } catch (err) {
          console.error('Error parsing attorney details:', err);
          this.swalService.error('An error occurred while parsing State Attorney details.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to load State Attorney details.';
        this.swalService.error(msg);
        this.router.navigate(['/state-attorneys']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data = { ...this.form.value };

    // Format date_of_birth safely to YYYY-MM-DD string
    if (data.date_of_birth) {
      const d = new Date(data.date_of_birth);
      if (!isNaN(d.getTime())) {
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        data.date_of_birth = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
      } else {
        data.date_of_birth = null;
      }
    }

    // Send null instead of empty string for optional fields
    Object.keys(data).forEach((key) => {
      if (data[key] === '') {
        data[key] = null;
      }
    });

    const request = this.isEditMode && this.attorneyId
      ? this.service.updateAttorney(this.attorneyId, data)
      : this.service.createAttorney(data);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.swalService.success(
          `State Attorney ${this.isEditMode ? 'updated' : 'registered'} successfully.`
        );
        this.router.navigate(['/state-attorneys']);
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || err?.message || 'Operation failed.';
        this.swalService.error(msg);
      },
    });
  }

  private minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const dob = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age >= minAge ? null : { minAge: true };
    };
  }
}
