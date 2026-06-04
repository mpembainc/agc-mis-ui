import { Component, inject, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { StateAttorneysService } from '../services/state-attorneys.service';
import { StateAttorney, Mda, Grade } from '../models/state-attorney.model';
import { SwalService } from '@shared/services/swal.service';
import { DataTableComponent, TableColumn, TableFilter } from '@shared/components/data-table/data-table.component';
import { ActionButtonComponent } from '@shared/components/action-button/action-button.component';

@Component({
  selector: 'app-attorney-list',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    DataTableComponent,
    ActionButtonComponent,
  ],
  templateUrl: './attorney-list.component.html',
  styleUrls: ['./attorney-list.component.scss'],
})
export class AttorneyListComponent implements OnInit {
  private service = inject(StateAttorneysService);
  private router = inject(Router);
  private swalService = inject(SwalService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('mdaTpl', { static: true }) mdaTpl!: TemplateRef<any>;
  @ViewChild('gradeTpl', { static: true }) gradeTpl!: TemplateRef<any>;

  attorneys: StateAttorney[] = [];
  mdas: Mda[] = [];
  grades: Grade[] = [];
  loading = false;
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  activeFilters: Record<string, any> = {};
  searchText = '';

  columns: TableColumn[] = [
    { key: 'full_name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'zanid', label: 'Zan ID', type: 'text' },
    {
      key: 'mda_id',
      label: 'MDA',
      type: 'text',
      generated: (row: StateAttorney) => this.getMdaCode(row.mda_id),
    },
    {
      key: 'current_grade_id',
      label: 'Grade',
      type: 'text',
      generated: (row: StateAttorney) => row.current_grade,
    },
    { key: 'status', label: 'Status' },
  ];

  filters: TableFilter[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'On Leave', value: 'on_leave' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Seconded', value: 'seconded' },
        { label: 'Resigned', value: 'resigned' },
        { label: 'Retired', value: 'retired' },
      ],
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' },
      ],
    },
    {
      key: 'mda_id',
      label: 'MDA',
      type: 'select',
      options: [],
    },
  ];

  ngOnInit(): void {
    this.loadLookups();
    this.loadAttorneys();
  }

  loadLookups(): void {
    this.service.getMdas().subscribe({
      next: (res) => {
        this.mdas = res.data;
        this.updateMdaFilterOptions();
      },
    });
  }

  private updateMdaFilterOptions(): void {
    const mdaFilter = this.filters.find((f) => f.key === 'mda_id');
    if (mdaFilter) {
      mdaFilter.options = this.mdas.map((m) => ({
        label: `${m.code} - ${m.name}`,
        value: m.id,
      }));
      setTimeout(() => {
        this.filters = [...this.filters];
        this.cdr.detectChanges();
      });
    }
  }

  loadAttorneys(): void {
    this.loading = true;
    const params = {
      page: this.pageIndex + 1,
      per_page: this.pageSize,
      search: this.searchText || undefined,
      ...this.activeFilters,
    };

    this.service.getAttorneys(params).subscribe({
      next: (res) => {
        this.attorneys = res.data.data;
        this.totalItems = res.data.total;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.swalService.error('Failed to load State Attorneys.');
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAttorneys();
  }

  onSearch(search: string): void {
    this.searchText = search;
    this.pageIndex = 0;
    this.loadAttorneys();
  }

  onFilterChange(filters: Record<string, any>): void {
    // Filter out null or empty values
    const cleanFilters: Record<string, any> = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== '') {
        cleanFilters[key] = filters[key];
      }
    });

    this.activeFilters = cleanFilters;
    this.pageIndex = 0;
    this.loadAttorneys();
  }

  onView(row: StateAttorney): void {
    this.router.navigate(['/state-attorneys/view', row.id]);
  }

  onEdit(row: StateAttorney): void {
    this.router.navigate(['/state-attorneys/edit', row.id]);
  }

  onDelete(row: StateAttorney): void {
    this.swalService
      .confirm(`Are you sure you want to delete ${row.full_name}?`, 'Delete State Attorney', 'Delete')
      .then((res) => {
        if (res.isConfirmed) {
          this.service.deleteAttorney(row.id).subscribe({
            next: () => {
              this.swalService.success('State Attorney deleted successfully.');
              this.loadAttorneys();
            },
            error: (err) => {
              const msg = err?.error?.message || err?.message || 'Failed to delete State Attorney.';
              this.swalService.error(msg);
            },
          });
        }
      });
  }

  getMdaCode(id?: string): string {
    if (!id) return '-';
    const mda = this.mdas.find((m) => m.id === id);
    return mda ? mda.code : '-';
  }
}

