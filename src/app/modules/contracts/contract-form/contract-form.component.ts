import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ContractsService } from '../services/contracts.service';
import { LookupsService } from '@modules/administration/services/lookups.service';
import { Contract } from '../models/contract.model';
import { SwalService } from '@shared/services/swal.service';

@Component({
  selector: 'app-contract-form',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
})
export class ContractFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contractsService = inject(ContractsService);
  private lookupsService = inject(LookupsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private swalService = inject(SwalService);

  form!: FormGroup;
  isEditMode = false;
  contractId: string | null = null;
  loading = signal(false);
  submitting = signal(false);

  // Dropdown lists
  mdas = signal<any[]>([]);
  contractTypes = signal<any[]>([]);
  priorities = signal<any[]>([]);
  statuses = [
    { label: 'Draft Vetting Request', value: 'draft' },
    { label: 'Submitted to Chambers', value: 'submitted' },
    { label: 'Vetting Vetting In-Progress', value: 'under_review' },
    { label: 'Approved (Pending Signature)', value: 'approved' },
    { label: 'Rejected / Returned', value: 'rejected' },
    { label: 'Signed Contract', value: 'signed' },
    { label: 'Active Service / Supply', value: 'active' },
    { label: 'Completed Agreement', value: 'completed' },
    { label: 'Terminated Agreement', value: 'terminated' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownOptions();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.contractId = id;
        this.loadContractDetails(id);
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      contract_number: ['', [Validators.required, Validators.maxLength(50)]],
      mda_id: ['', [Validators.required]],
      type_id: [null],
      priority_id: [null],
      partners: ['', [Validators.maxLength(1000)]],
      subject_matter: ['', [Validators.maxLength(2000)]],
      duration_months: [null, [Validators.min(1)]],
      value: [null, [Validators.min(0)]],
      strategic_interest_flag: [false],
      status: ['draft', [Validators.required]],
    });
  }

  loadDropdownOptions(): void {
    // Fetch MDAs
    this.lookupsService.getItems('mdas').subscribe({
      next: (res) => this.mdas.set(res.data || []),
    });

    // Fetch Contract Types
    this.lookupsService.getItems('contract-types').subscribe({
      next: (res) => this.contractTypes.set(res.data || []),
    });

    // Fetch Priorities
    this.lookupsService.getItems('priorities').subscribe({
      next: (res) => this.priorities.set(res.data || []),
    });
  }

  loadContractDetails(id: string): void {
    this.loading.set(true);
    this.contractsService.getContract(id).subscribe({
      next: (res) => {
        const contract = res.data;
        this.form.patchValue({
          contract_number: contract.contract_number,
          mda_id: contract.mda_id,
          type_id: contract.type_id || null,
          priority_id: contract.priority_id || null,
          partners: contract.partners || '',
          subject_matter: contract.subject_matter || '',
          duration_months: contract.duration_months || null,
          value: contract.value || null,
          strategic_interest_flag: !!contract.strategic_interest_flag,
          status: contract.status || 'draft',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load contract details.');
        this.router.navigate(['/contracts']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const payload: Contract = { ...this.form.value };

    // Set empty strings to null for optional database fields
    if (payload.partners === '') payload.partners = undefined;
    if (payload.subject_matter === '') payload.subject_matter = undefined;

    const request = this.isEditMode && this.contractId
      ? this.contractsService.updateContract(this.contractId, payload)
      : this.contractsService.createContract(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.swalService.success(
          `Contract "${payload.contract_number}" has been successfully ${this.isEditMode ? 'updated' : 'created'}.`
        );
        this.router.navigate(['/contracts']);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to save contract entry.';
        this.swalService.error(msg);
      },
    });
  }
}
