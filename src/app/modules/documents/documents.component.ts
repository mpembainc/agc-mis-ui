import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DocumentsService } from './services/documents.service';
import { Document } from './models/document.model';
import { SwalService } from '@shared/services/swal.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DocumentUploadDialogComponent } from './components/document-upload-dialog/document-upload-dialog.component';
import { DocumentLogsDialogComponent } from './components/document-logs-dialog/document-logs-dialog.component';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu';
import { PageEvent } from '@angular/material/paginator';
import {
  LucideFolder,
  LucideUpload,
  LucideFile,
  LucideSearch,
  LucidePlus,
  LucideArrowLeft,
  LucideArrowRight,
  LucideRefreshCw,
} from '@lucide/angular';

@Component({
  selector: 'app-documents',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    ButtonComponent,
    LucideFolder,
    LucideUpload,
    LucideFile,
    LucideSearch,
    DataTableComponent,
  ],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  protected documentsService = inject(DocumentsService);
  private dialog = inject(MatDialog);
  private swalService = inject(SwalService);

  // Expose icon components as variables for app-button
  protected readonly plusIcon = LucidePlus;
  protected readonly uploadIcon = LucideUpload;
  protected readonly arrowLeftIcon = LucideArrowLeft;
  protected readonly arrowRightIcon = LucideArrowRight;
  protected readonly refreshIcon = LucideRefreshCw;

  // Define action menu items
  protected readonly actionMenuItems: ActionMenuItem<Document>[] = [
    {
      label: 'View Inline',
      icon: 'visibility',
      color: 'primary',
      action: (doc: Document) => this.viewDocument(doc),
    },
    {
      label: 'Download File',
      icon: 'download',
      color: 'success',
      action: (doc: Document) => this.downloadDocument(doc),
    },
    {
      label: 'Upload New Version',
      icon: 'file_upload',
      color: 'accent',
      action: (doc: Document) => this.openVersionUploadDialog(doc),
    },
    {
      label: 'Audit History',
      icon: 'history',
      color: 'info',
      action: (doc: Document) => this.openLogsDialog(doc),
    },
    {
      label: 'Delete Document',
      icon: 'delete',
      color: 'warn',
      action: (doc: Document) => this.deleteDocument(doc),
    },
  ];

  // Local state signals
  searchQuery = signal('');
  activeEntityFilter = signal<string>('all'); // 'all', 'General', 'Contract', 'LeaveRequest', 'Attorney'

  // Define data table columns
  tableColumns: TableColumn[] = [
    { key: 'original_name', label: 'File Details' },
    { key: 'version_number', label: 'Version' },
    { key: 'size_bytes', label: 'Size', generated: (row: Document) => this.formatBytes(row.size_bytes) },
    { key: 'entity_type', label: 'Linked Context' },
    { key: 'uploader_name', label: 'Uploaded By', generated: (row: Document) => row.uploader?.name || 'System Uploader' },
    { key: 'created_at', label: 'Upload Date' },
  ];

  // Computed totals and pagination details
  totalPages = computed(() => {
    const total = this.documentsService.total();
    const perPage = this.documentsService.perPage();
    return Math.ceil(total / perPage) || 1;
  });

  ngOnInit(): void {
    this.fetchDocuments();
  }

  fetchDocuments(): void {
    const params: any = {
      page: this.documentsService.page(),
      per_page: this.documentsService.perPage(),
      search: this.searchQuery().trim(),
    };

    if (this.activeEntityFilter() !== 'all') {
      params.entity_type = this.activeEntityFilter();
    }

    this.documentsService.loadDocuments(params).subscribe({
      error: () => this.swalService.error('Failed to load documents repository.'),
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.documentsService.page.set(1);
    this.fetchDocuments();
  }

  onPageEvent(event: PageEvent): void {
    this.documentsService.page.set(event.pageIndex + 1);
    this.documentsService.perPage.set(event.pageSize);
    this.fetchDocuments();
  }

  onSearchChange(): void {
    this.documentsService.page.set(1);
    this.fetchDocuments();
  }

  onFilterChange(filter: string): void {
    this.activeEntityFilter.set(filter);
    this.documentsService.page.set(1);
    this.fetchDocuments();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.documentsService.page.set(newPage);
      this.fetchDocuments();
    }
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '700px',
      minWidth: '700px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((uploaded) => {
      if (uploaded) {
        this.fetchDocuments();
      }
    });
  }

  openVersionUploadDialog(document: Document): void {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '560px',
      data: { document },
    });

    dialogRef.afterClosed().subscribe((uploaded) => {
      if (uploaded) {
        this.fetchDocuments();
      }
    });
  }

  openLogsDialog(document: Document): void {
    this.dialog.open(DocumentLogsDialogComponent, {
      width: '640px',
      data: { document },
    });
  }

  downloadDocument(document: Document): void {
    this.documentsService.downloadFile(document.id, document.original_name);
  }

  viewDocument(document: Document): void {
    this.documentsService.viewFileInline(document.id);
  }

  async deleteDocument(document: Document): Promise<void> {
    const confirm = await this.swalService.confirm(
      `Are you sure you want to delete "${document.original_name}"? This will move it to the recycle bin.`,
      'Delete Document',
      'Yes, Delete'
    );

    if (confirm.isConfirmed) {
      this.documentsService.deleteDocument(document.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.swalService.success('Document deleted successfully.');
            this.fetchDocuments();
          }
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'Failed to delete document.';
          this.swalService.error(msg);
        },
      });
    }
  }

  // Helper to format bytes into readable sizes
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Get nice visual icons for various file types
  getFileTypeClass(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'text-red-500 bg-red-50 border-red-100';
    if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessing')) return 'text-blue-500 bg-blue-50 border-blue-100';
    if (mimeType.includes('excel') || mimeType.includes('officedocument.spreadsheet') || mimeType.includes('csv')) return 'text-green-500 bg-green-50 border-green-100';
    if (mimeType.includes('image')) return 'text-purple-500 bg-purple-50 border-purple-100';
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-slate-500 bg-slate-50 border-slate-100';
  }
}
