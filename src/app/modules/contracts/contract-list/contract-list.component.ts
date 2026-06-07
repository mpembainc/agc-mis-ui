import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, TableColumn, TableFilter } from '@shared/components/data-table/data-table.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { ContractsService } from '../services/contracts.service';
import { LookupsService } from '@modules/administration/services/lookups.service';
import { Contract } from '../models/contract.model';
import { SwalService } from '@shared/services/swal.service';

@Component({
  selector: 'app-contract-list',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    DataTableComponent,
  ],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnInit {
  private contractsService = inject(ContractsService);
  private lookupsService = inject(LookupsService);
  private router = inject(Router);
  private swalService = inject(SwalService);

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('valueTpl', { static: true }) valueTpl!: TemplateRef<any>;
  @ViewChild('strategicTpl', { static: true }) strategicTpl!: TemplateRef<any>;

  contracts: Contract[] = [];
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  searchText = '';
  activeFilters: Record<string, any> = {};

  columns: TableColumn[] = [
    { key: 'contract_number', label: 'Contract Number', type: 'text' },
    { key: 'subject_matter', label: 'Subject Matter', type: 'text' },
    { key: 'partners', label: 'Parties', type: 'text' },
    { key: 'value', label: 'Contract Value' },
    { key: 'strategic_interest_flag', label: 'Strategic' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created At', type: 'date', format: 'mediumDate' },
  ];

  filters: TableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Signed', value: 'signed' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Terminated', value: 'terminated' },
      ],
    },
    {
      key: 'mda_id',
      label: 'Originating MDA',
      type: 'select',
      options: [{ label: 'All MDAs', value: '' }],
    },
    {
      key: 'strategic_only',
      label: 'Interest Level',
      type: 'select',
      options: [
        { label: 'All Contracts', value: '' },
        { label: 'Strategic Interest Only', value: 'true' },
      ],
    },
  ];

  actionMenuItems: ActionMenuItem<Contract>[] = [
    {
      label: 'Edit Contract',
      icon: 'edit',
      color: 'primary',
      action: (row) => this.onEdit(row),
    },
    {
      label: 'Delete Contract',
      icon: 'delete',
      color: 'warn',
      action: (row) => this.onDelete(row),
    },
  ];

  ngOnInit(): void {
    this.loadMdaFilterOptions();
    this.loadContracts();
  }

  loadMdaFilterOptions(): void {
    this.lookupsService.getItems('mdas').subscribe({
      next: (res) => {
        const mdaFilter = this.filters.find((f) => f.key === 'mda_id');
        if (mdaFilter) {
          mdaFilter.options = [
            { label: 'All MDAs', value: '' },
            ...res.data.map((mda: any) => ({ label: mda.name, value: mda.id })),
          ];
        }
      },
    });
  }

  loadContracts(): void {
    this.loading.set(true);

    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      search: this.searchText || undefined,
      status: this.activeFilters['status'] || undefined,
      mda_id: this.activeFilters['mda_id'] || undefined,
      strategic_only: this.activeFilters['strategic_only'] === 'true' ? true : undefined,
    };

    this.contractsService.getContracts(params).subscribe({
      next: (res) => {
        this.contracts = res.data.data;
        this.totalItems = res.data.total;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load contracts.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadContracts();
  }

  onSearch(search: string): void {
    this.searchText = search;
    this.pageIndex = 0;
    this.loadContracts();
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
    this.loadContracts();
  }

  onEdit(contract: Contract): void {
    this.router.navigate(['/contracts/edit', contract.id]);
  }

  onDelete(contract: Contract): void {
    this.swalService
      .confirm(
        `Are you sure you want to delete contract "${contract.contract_number}"? This will soft delete the record.`,
        'Delete Contract',
        'Delete'
      )
      .then((res) => {
        if (res.isConfirmed && contract.id) {
          this.loading.set(true);
          this.contractsService.deleteContract(contract.id).subscribe({
            next: () => {
              this.swalService.success('Contract deleted successfully.');
              this.loadContracts();
            },
            error: (err) => {
              this.loading.set(false);
              const msg = err?.error?.message || err?.message || 'Failed to delete contract.';
              this.swalService.error(msg);
            },
          });
        }
      });
  }

  getColumnTemplates(): Record<string, TemplateRef<any>> {
    return {
      status: this.statusTpl,
      value: this.valueTpl,
      strategic_interest_flag: this.strategicTpl,
    };
  }

  getStatusColorClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'under_review':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'approved':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'signed':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'completed':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'terminated':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  formatStatusLabel(status: string): string {
    if (!status) return 'Unknown';
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  formatCurrency(val: number): string {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(val);
  }
}
