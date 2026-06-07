import { Component, OnInit, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { WorkflowsService } from '../services/workflows.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { SwalService } from '@shared/services/swal.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface TaskRow {
  id: string; // instance id
  entity_type: string;
  entity_id: string;
  entity_name: string;
  entity_detail: string;
  node_name: string;
  start_time: string | null;
  working_days: number | null;
  comments: string | null;
}

@Component({
  selector: 'app-my-tasks',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DataTableComponent,
  ],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss'],
})
export class MyTasksComponent implements OnInit {
  private workflowsService = inject(WorkflowsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private swalService = inject(SwalService);

  @ViewChild('typeTpl', { static: true }) typeTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('detailsTpl', { static: true }) detailsTpl!: TemplateRef<any>;

  tasks: TaskRow[] = [];
  loading = signal(false);

  columns: TableColumn[] = [
    { key: 'entity_type', label: 'Module' },
    { key: 'entity_name', label: 'Task Item', type: 'text' },
    { key: 'entity_detail', label: 'Summary' },
    { key: 'node_name', label: 'Current State' },
    { key: 'start_time', label: 'Assigned Date', type: 'date', format: 'mediumDate' },
  ];

  actionMenuItems: ActionMenuItem<TaskRow>[] = [
    {
      label: 'Action Task / View Details',
      icon: 'visibility',
      color: 'primary',
      action: (row) => this.onActionTask(row),
    },
  ];

  ngOnInit(): void {
    this.loadMyTasks();
  }

  loadMyTasks(): void {
    this.loading.set(true);
    const currentUser = this.authService.getUser();
    const currentUserId = String(currentUser?.id);

    this.workflowsService.getWorkflowInstances({ per_page: 100 }).subscribe({
      next: (res) => {
        const myInstances = res.data.data.filter(inst => {
          const activeTask = inst.tasks?.find(t => t.end_time === null);
          return activeTask && String(activeTask.assigned_user_id) === currentUserId;
        });

        if (myInstances.length === 0) {
          this.tasks = [];
          this.loading.set(false);
          return;
        }

        const detailRequests = myInstances.map(inst => {
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
            this.tasks = detailedInstances.map(inst => {
              const activeTask = inst.tasks?.find(t => t.end_time === null)!;
              return {
                id: inst.id,
                entity_type: inst.entity_type,
                entity_id: inst.entity_id,
                entity_name: inst.entity_name || '',
                entity_detail: inst.entity_detail || '',
                node_name: activeTask.node_name,
                start_time: activeTask.start_time,
                working_days: activeTask.working_days,
                comments: activeTask.comments
              };
            });
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.swalService.error('Failed to load task details.');
          }
        });
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load workflow instances.');
      }
    });
  }

  onActionTask(task: TaskRow): void {
    this.router.navigate(['/workflows/details', task.id]);
  }

  getColumnTemplates(): Record<string, TemplateRef<any>> {
    return {
      entity_type: this.typeTpl,
      node_name: this.statusTpl,
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
