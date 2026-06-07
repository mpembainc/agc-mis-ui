import { Component, OnInit, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, TableColumn, TableFilter } from '@shared/components/data-table/data-table.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { WorkflowsService } from '../services/workflows.service';
import { SwalService } from '@shared/services/swal.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { WorkflowInstance } from '../models/workflow.model';

@Component({
  selector: 'app-workflow-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DataTableComponent,
  ],
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.scss'],
})
export class WorkflowListComponent implements OnInit {
  private workflowsService = inject(WorkflowsService);
  private router = inject(Router);
  private swalService = inject(SwalService);

  @ViewChild('typeTpl', { static: true }) typeTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('detailsTpl', { static: true }) detailsTpl!: TemplateRef<any>;

  workflows: WorkflowInstance[] = [];
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  activeFilters: Record<string, any> = {};

  columns: TableColumn[] = [
    { key: 'entity_type', label: 'Module' },
    { key: 'entity_name', label: 'Workflow Item', type: 'text' },
    { key: 'entity_detail', label: 'Summary' },
    { key: 'current_state', label: 'Current State' },
    { key: 'created_at', label: 'Initiated At', type: 'date', format: 'mediumDate' },
  ];

  filters: TableFilter[] = [
    {
      key: 'entity_type',
      label: 'Module',
      type: 'select',
      options: [
        { label: 'All Modules', value: '' },
        { label: 'Contract', value: 'contract' },
        { label: 'Leave Request', value: 'leave_request' },
      ],
    },
    {
      key: 'current_state',
      label: 'State',
      type: 'select',
      options: [
        { label: 'All States', value: '' },
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Signed', value: 'signed' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Terminated', value: 'terminated' },
      ],
    },
  ];

  actionMenuItems: ActionMenuItem<WorkflowInstance>[] = [
    {
      label: 'View History & Details',
      icon: 'visibility',
      color: 'primary',
      action: (row) => this.onViewDetails(row),
    },
  ];

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.loading.set(true);

    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      entity_type: this.activeFilters['entity_type'] || undefined,
      current_state: this.activeFilters['current_state'] || undefined,
    };

    this.workflowsService.getWorkflowInstances(params).subscribe({
      next: (res) => {
        const instances = res.data.data || [];
        this.totalItems = res.data.total;

        if (instances.length === 0) {
          this.workflows = [];
          this.loading.set(false);
          return;
        }

        const detailRequests = instances.map(inst => {
          if (inst.entity_type === 'contract') {
            return this.workflowsService.getContract(inst.entity_id).pipe(
              map(detailRes => ({
                ...inst,
                entity_name: detailRes.data.contract_number,
                entity_detail: `Parties: ${detailRes.data.partners || 'N/A'} | Value: ${this.formatCurrency(detailRes.data.value)}`
              })),
              catchError(() => of({
                ...inst,
                entity_name: `Contract`,
                entity_detail: `ID: ${inst.entity_id.substring(0, 8)}`
              }))
            );
          } else if (inst.entity_type === 'leave_request') {
            return this.workflowsService.getLeaveRequest(inst.entity_id).pipe(
              map(detailRes => ({
                ...inst,
                entity_name: `Leave Request (${this.capitalize(detailRes.data.leave_type)})`,
                entity_detail: `Attorney: ${detailRes.data.attorney?.full_name || 'N/A'} | Period: ${this.formatDate(detailRes.data.start_date)} to ${this.formatDate(detailRes.data.end_date)}`
              })),
              catchError(() => of({
                ...inst,
                entity_name: `Leave Request`,
                entity_detail: `ID: ${inst.entity_id.substring(0, 8)}`
              }))
            );
          } else {
            return of({
              ...inst,
              entity_name: `${this.capitalize(inst.entity_type)}`,
              entity_detail: `ID: ${inst.entity_id.substring(0, 8)}`
            });
          }
        });

        forkJoin(detailRequests).subscribe({
          next: (detailedInstances) => {
            this.workflows = detailedInstances;
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.swalService.error('Failed to load workflow details.');
          }
        });
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load workflows list.');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWorkflows();
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
    this.loadWorkflows();
  }

  onViewDetails(workflow: WorkflowInstance): void {
    this.router.navigate(['/workflows/details', workflow.id]);
  }

  getColumnTemplates(): Record<string, TemplateRef<any>> {
    return {
      entity_type: this.typeTpl,
      current_state: this.statusTpl,
      entity_detail: this.detailsTpl,
    };
  }

  // --- UI Helpers ---

  capitalize(str: string): string {
    if (!str) return '';
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined) return 'N/A';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(num);
  }

  getStatusColorClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'draft':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'submitted':
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'approved':
      case 'signed':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'completed':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'cancelled':
      case 'terminated':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }
}
