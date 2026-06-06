import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { LookupsService } from '../../services/lookups.service';
import { SwalService } from '@shared/services/swal.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LookupConfig, LookupField } from '../lookup-schema.config';

@Component({
  selector: 'app-lookup-dialog',
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
    MatDatepickerModule,
    MatDialogModule,
    DialogLayoutComponent,
    MatProgressBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './lookup-dialog.component.html',
  styleUrls: ['./lookup-dialog.component.scss'],
})
export class LookupDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lookupsService = inject(LookupsService);
  private swalService = inject(SwalService);

  form!: FormGroup;
  isEditMode = false;
  config!: LookupConfig;
  item: any = null;

  selectOptions = new Map<string, any[]>();
  loading = signal(false);
  submitting = signal(false);

  constructor(
    public dialogRef: MatDialogRef<LookupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { config: LookupConfig; item?: any }
  ) {
    this.config = data.config;
    if (data?.item) {
      this.isEditMode = true;
      this.item = data.item;
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadSelectOptions();
    if (this.isEditMode && this.item) {
      this.patchFormValues();
    }
  }

  initForm(): void {
    const group: any = {};
    this.config.fields.forEach((field) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.max) {
        validators.push(Validators.maxLength(field.max));
      }

      const isEditDisabled = this.isEditMode && field.disabledInEdit;

      let defaultValue: any = '';
      if (field.type === 'checkbox') {
        defaultValue = true;
      }

      group[field.name] = [
        { value: defaultValue, disabled: isEditDisabled },
        validators,
      ];
    });
    this.form = this.fb.group(group);
  }

  loadSelectOptions(): void {
    this.config.fields.forEach((field) => {
      if (field.type === 'select' && field.optionsResource) {
        this.lookupsService.getItems(field.optionsResource).subscribe({
          next: (res) => {
            this.selectOptions.set(field.name, res.data || []);
          },
        });
      }
    });
  }

  patchFormValues(): void {
    const patchVal: any = {};
    this.config.fields.forEach((field) => {
      let val = this.item[field.name];
      if (field.type === 'date' && val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          val = d;
        }
      }
      patchVal[field.name] = val;
    });
    this.form.patchValue(patchVal);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const payload = { ...this.form.getRawValue() };

    // Format Date Fields to YYYY-MM-DD
    this.config.fields.forEach((field) => {
      if (field.type === 'date' && payload[field.name]) {
        const d = new Date(payload[field.name]);
        if (!isNaN(d.getTime())) {
          const month = '' + (d.getMonth() + 1);
          const day = '' + d.getDate();
          const year = d.getFullYear();
          payload[field.name] = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');

          if (this.config.key === 'holidays' && field.name === 'holiday_date') {
            payload['year'] = year;
          }
        }
      }
      // Send null instead of empty string for optional fields
      if (payload[field.name] === '') {
        payload[field.name] = null;
      }
    });

    const request = this.isEditMode && this.item
      ? this.lookupsService.updateItem(this.config.key, this.item.id, payload)
      : this.lookupsService.createItem(this.config.key, payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.swalService.success(`${this.config.label} entry saved successfully.`);
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
