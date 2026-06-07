import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, TableColumn, TableFilter } from '@shared/components/data-table/data-table.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { LeaveRequestsService } from '../services/leave-requests.service';
import { WorkflowsService } from '@modules/workflows/services/workflows.service';
import { StateAttorneysService } from '@modules/state-attorneys/services/state-attorneys.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { SwalService } from '@shared/services/swal.service';
import { LeaveRequest } from '../models/leave-request.model';
import { LeaveRequestDialogComponent } from '../leave-request-dialog/leave-request-dialog.component';
import { matDialogConfig } from '@shared/config';
import { ActionButtonComponent } from "@shared/components/action-button/action-button.component";

@Component({
  selector: 'app-leave-request-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DataTableComponent,
    ActionButtonComponent
],
  templateUrl: './leave-request-list.component.html',
  styleUrls: ['./leave-request-list.component.scss'],
})
export class LeaveRequestListComponent implements OnInit {
  private leaveRequestsService = inject(LeaveRequestsService);
  private workflowsService = inject(WorkflowsService);
  private stateAttorneysService = inject(StateAttorneysService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private swalService = inject(SwalService);
  private router = inject(Router);

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('typeTpl', { static: true }) typeTpl!: TemplateRef<any>;

  leaveRequests: LeaveRequest[] = [];
  loading = signal(false);
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  activeFilters: Record<string, any> = {};

  isAdmin = false;
  resolvedAttorneyId: string | null = null;

  columns: TableColumn[] = [
    { key: 'attorney_name', label: 'State Attorney', type: 'text' },
    { key: 'leave_type', label: 'Leave Type' },
    { key: 'start_date', label: 'Start Date', type: 'date', format: 'mediumDate' },
    { key: 'end_date', label: 'End Date', type: 'date', format: 'mediumDate' },
    { key: 'total_days', label: 'Days' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Applied On', type: 'date', format: 'mediumDate' },
  ];

  filters: TableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      key: 'leave_type',
      label: 'Leave Type',
      type: 'select',
      options: [
        { label: 'All Types', value: '' },
        { label: 'Annual', value: 'annual' },
        { label: 'Sick', value: 'sick' },
        { label: 'Maternity', value: 'maternity' },
        { label: 'Paternity', value: 'paternity' },
        { label: 'Compassionate', value: 'compassionate' },
        { label: 'Study', value: 'study' },
        { label: 'Unpaid', value: 'unpaid' },
      ],
    },
  ];

  actionMenuItems: ActionMenuItem<LeaveRequest>[] = [
    {
      label: 'View Timeline & Log',
      icon: 'history',
      color: 'primary',
      action: (row) => this.onViewWorkflow(row),
    },
    {
      label: 'Cancel Leave Request',
      icon: 'cancel',
      color: 'warn',
      hidden: (row) => row.status !== 'pending' && row.status !== 'approved',
      action: (row) => this.onCancelRequest(row),
    },
    {
      label: 'Delete Application',
      icon: 'delete',
      color: 'warn',
      hidden: (row) => row.status === 'approved',
      action: (row) => this.onDeleteRequest(row),
    },
  ];

  LeaveDialog = LeaveRequestDialogComponent;
  matDialogConfig: MatDialogConfig = {
    ...matDialogConfig,
    width: '600px',
  };

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.isAdmin = currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('super-admin');

    this.resolveAttorneyAndLoad();
  }

  resolveAttorneyAndLoad(): void {
    if (this.isAdmin) {
      this.loadLeaveRequests();
    } else {
      this.loading.set(true);
      const currentUser = this.authService.getUser();
      // Search for current attorney record
      this.stateAttorneysService.getAttorneys({ search: currentUser.email }).subscribe({
        next: (res) => {
          const list = res.data.data || [];
          const matched = list.find(a => a.email?.toLowerCase() === currentUser.email?.toLowerCase());
          if (matched) {
            this.resolvedAttorneyId = matched.id;
            this.loadLeaveRequests();
          } else {
            this.loading.set(false);
            this.swalService.error('Your user account is not registered as a State Attorney.');
          }
        },
        error: () => {
          this.loading.set(false);
          this.swalService.error('Failed to resolve state attorney profile.');
        }
      });
    }
  }

  loadLeaveRequests(): void {
    this.loading.set(true);

    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      status: this.activeFilters['status'] || undefined,
      leave_type: this.activeFilters['leave_type'] || undefined,
      attorney_id: this.isAdmin ? undefined : (this.resolvedAttorneyId || undefined),
    };

    this.leaveRequestsService.getLeaveRequests(params).subscribe({
      next: (res) => {
        // Flatten list for table mapping
        this.leaveRequests = (res.data.data || []).map((lr: any) => ({
          ...lr,
          attorney_name: lr.attorney?.full_name || 'N/A'
        }));
        this.totalItems = res.data.total;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load leave requests.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLeaveRequests();
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
    this.loadLeaveRequests();
  }

  onViewWorkflow(request: LeaveRequest): void {
    this.loading.set(true);
    this.workflowsService.getWorkflowInstances({ entity_type: 'leave_request', per_page: 100 }).subscribe({
      next: (wfRes) => {
        this.loading.set(false);
        const matchedWf = wfRes.data.data.find(w => w.entity_id === request.id);
        if (matchedWf) {
          this.router.navigate(['/workflows/details', matchedWf.id]);
        } else {
          this.swalService.error('No active workflow instance found for this leave request.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load workflow information.');
      }
    });
  }

  onCancelRequest(request: LeaveRequest): void {
    this.swalService.confirm(
      `Are you sure you want to cancel this leave request?`,
      'Cancel Leave Application',
      'Cancel Leave'
    ).then((res) => {
      if (res.isConfirmed && request.id) {
        this.loading.set(true);
        this.leaveRequestsService.updateLeaveRequest(request.id, { status: 'cancelled' }).subscribe({
          next: () => {
            this.swalService.success('Leave request cancelled successfully.');
            this.loadLeaveRequests();
          },
          error: (err) => {
            this.loading.set(false);
            const msg = err?.error?.message || err?.message || 'Failed to cancel leave request.';
            this.swalService.error(msg);
          }
        });
      }
    });
  }

  onDeleteRequest(request: LeaveRequest): void {
    this.swalService.confirm(
      `Are you sure you want to delete this leave request application?`,
      'Delete Application',
      'Delete'
    ).then((res) => {
      if (res.isConfirmed && request.id) {
        this.loading.set(true);
        this.leaveRequestsService.deleteLeaveRequest(request.id).subscribe({
          next: () => {
            this.swalService.success('Leave application deleted successfully.');
            this.loadLeaveRequests();
          },
          error: (err) => {
            this.loading.set(false);
            const msg = err?.error?.message || err?.message || 'Failed to delete application.';
            this.swalService.error(msg);
          }
        });
      }
    });
  }

  onDialogClosed(result: any): void {
    if (result) {
      this.loadLeaveRequests();
    }
  }

  getColumnTemplates(): Record<string, TemplateRef<any>> {
    return {
      leave_type: this.typeTpl,
      status: this.statusTpl,
    };
  }

  // --- UI Helpers ---

  capitalize(str: string): string {
    if (!str) return '';
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  getStatusColorClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'cancelled':
        return 'bg-slate-100 text-slate-650 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }
}
