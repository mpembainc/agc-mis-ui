import { Component, OnInit, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { ActionButtonComponent } from '@shared/components/action-button/action-button.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { LOOKUP_CONFIGS, LookupConfig } from './lookup-schema.config';
import { LookupsService } from '../services/lookups.service';
import { SwalService } from '@shared/services/swal.service';
import { LookupDialogComponent } from './lookup-dialog/lookup-dialog.component';
import { matDialogConfig } from '@shared/config';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-lookups',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    DataTableComponent,
    ActionButtonComponent,
    LucideDynamicIcon,
  ],
  templateUrl: './lookups.component.html',
  styleUrls: ['./lookups.component.scss'],
})
export class LookupsComponent implements OnInit {
  private lookupsService = inject(LookupsService);
  private swalService = inject(SwalService);
  private dialog = inject(MatDialog);

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('booleanTpl', { static: true }) booleanTpl!: TemplateRef<any>;
  @ViewChild('colorTpl', { static: true }) colorTpl!: TemplateRef<any>;

  lookupConfigs = LOOKUP_CONFIGS;
  selectedConfig = signal<LookupConfig>(LOOKUP_CONFIGS[0]);
  items = signal<any[]>([]);
  loading = signal(false);
  searchText = '';

  actionMenuItems: ActionMenuItem<any>[] = [
    {
      label: 'Edit Entry',
      icon: 'edit',
      color: 'primary',
      action: (row) => this.onEdit(row),
    },
    {
      label: 'Delete Entry',
      icon: 'delete',
      color: 'warn',
      action: (row) => this.onDelete(row),
    },
  ];

  LookupDialog = LookupDialogComponent;
  matDialogConfig: MatDialogConfig = {
    ...matDialogConfig,
    position: {
      top: '15vh',
    },
    width: '800px',
  };

  ngOnInit(): void {
    this.loadItems();
  }

  selectLookup(config: LookupConfig): void {
    this.selectedConfig.set(config);
    this.searchText = '';
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.lookupsService.getItems(this.selectedConfig().key, this.searchText).subscribe({
      next: (res) => {
        this.items.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error(`Failed to load items for "${this.selectedConfig().label}".`);
      },
    });
  }

  onSearch(search: string): void {
    this.searchText = search;
    this.loadItems();
  }

  onEdit(row: any): void {
    const dialogRef = this.dialog.open(LookupDialogComponent, {
      ...this.matDialogConfig,
      data: { config: this.selectedConfig(), item: row },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadItems();
      }
    });
  }

  onDelete(row: any): void {
    this.swalService
      .confirm(
        `Are you sure you want to delete this entry? This action cannot be undone.`,
        'Delete Lookup Item',
        'Delete'
      )
      .then((res) => {
        if (res.isConfirmed) {
          this.loading.set(true);
          this.lookupsService.deleteItem(this.selectedConfig().key, row.id).subscribe({
            next: () => {
              this.swalService.success('Item deleted successfully.');
              this.loadItems();
            },
            error: (err) => {
              this.loading.set(false);
              const msg = err?.error?.message || err?.message || 'Failed to delete item.';
              this.swalService.error(msg);
            },
          });
        }
      });
  }

  onDialogClosed(result: any): void {
    if (result) {
      this.loadItems();
    }
  }

  // Helper to dynamically match templates for columns
  getColumnTemplates(): Record<string, TemplateRef<any>> {
    const templates: Record<string, TemplateRef<any>> = {};
    this.selectedConfig().columns.forEach((col) => {
      if (col.key === 'is_active') {
        templates['is_active'] = this.statusTpl;
      } else if (
        col.key === 'is_recognised' ||
        col.key === 'requires_zppra_template' ||
        col.key === 'requires_attachment' ||
        col.key === 'is_recurring'
      ) {
        templates[col.key] = this.booleanTpl;
      } else if (col.key === 'color_code') {
        templates['color_code'] = this.colorTpl;
      }
    });
    return templates;
  }
}
