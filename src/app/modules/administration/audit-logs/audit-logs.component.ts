import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, TableColumn, TableFilter } from '@shared/components/data-table/data-table.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { AuditLogsService } from '../services/audit-logs.service';
import { AuditLog } from '../models/audit-log.model';
import { SwalService } from '@shared/services/swal.service';
import { AuditLogDetailsDialogComponent } from './audit-log-details-dialog/audit-log-details-dialog.component';
import { matDialogConfig } from '@shared/config';

@Component({
  selector: 'app-audit-logs',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DataTableComponent,
  ],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss'],
})
export class AuditLogsComponent implements OnInit {
  private auditLogsService = inject(AuditLogsService);
  private dialog = inject(MatDialog);
  private swalService = inject(SwalService);

  @ViewChild('userTpl', { static: true }) userTpl!: TemplateRef<any>;
  @ViewChild('actionTpl', { static: true }) actionTpl!: TemplateRef<any>;

  logs: AuditLog[] = [];
  loading = signal(false);
  totalItems = 0;
  pageSize = 15;
  pageIndex = 0;
  searchText = '';
  activeFilters: Record<string, any> = {};

  columns: TableColumn[] = [
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Resource' },
    { key: 'entity_id', label: 'Resource UUID', type: 'text' },
    { key: 'ip_address', label: 'IP Address', type: 'text' },
    { key: 'created_at', label: 'Timestamp', type: 'date', format: 'medium' },
  ];

  filters: TableFilter[] = [
    {
      key: 'action',
      label: 'Action',
      type: 'select',
      options: [
        { label: 'All Actions', value: '' },
        { label: 'Create', value: 'CREATE' },
        { label: 'Update', value: 'UPDATE' },
        { label: 'Delete', value: 'DELETE' },
      ],
    },
    {
      key: 'entity_type',
      label: 'Resource Type',
      type: 'input',
      placeholder: 'e.g. User, Role',
    },
    {
      key: 'date_from',
      label: 'Date From',
      type: 'datepicker',
      placeholder: 'Choose a date',
    },
    {
      key: 'date_to',
      label: 'Date To',
      type: 'datepicker',
      placeholder: 'Choose a date',
    },
  ];

  actionMenuItems: ActionMenuItem<AuditLog>[] = [
    {
      label: 'View Detailed Diff',
      icon: 'visibility',
      color: 'primary',
      action: (row) => this.onViewDetails(row),
    },
  ];

  matDialogConfig: MatDialogConfig = {
    ...matDialogConfig,
    position: {
      top: '10vh',
    },
    width: '900px',
  };

  ngOnInit(): void {
    this.loadLogs();
  }

  formatDateParam(date: any): string | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    if (isNaN(d.getTime())) return undefined;
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  loadLogs(): void {
    this.loading.set(true);

    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      entity_type: this.activeFilters['entity_type'] || undefined,
      action: this.activeFilters['action'] || undefined,
      date_from: this.formatDateParam(this.activeFilters['date_from']),
      date_to: this.formatDateParam(this.activeFilters['date_to']),
    };

    this.auditLogsService.getAuditLogs(params).subscribe({
      next: (res) => {
        this.logs = res.data.data;
        this.totalItems = res.data.total;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load audit logs.');
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
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
    this.loadLogs();
  }

  onViewDetails(log: AuditLog): void {
    this.dialog.open(AuditLogDetailsDialogComponent, {
      ...this.matDialogConfig,
      data: { log },
    });
  }

  getColumnTemplates(): Record<string, TemplateRef<any>> {
    return {
      user: this.userTpl,
      action: this.actionTpl,
    };
  }

  getActionColorClass(action: string): string {
    switch (action.toUpperCase()) {
      case 'CREATE':
      case 'STORE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UPDATE':
      case 'EDIT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELETE':
      case 'DESTROY':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }
}
