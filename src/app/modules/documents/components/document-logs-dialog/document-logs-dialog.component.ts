import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { DocumentsService } from '../../services/documents.service';
import { SwalService } from '@shared/services/swal.service';
import { Document, DocumentAccessLog } from '../../models/document.model';
import { LucideHistory, LucideInfo } from '@lucide/angular';

@Component({
  selector: 'app-document-logs-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    DialogLayoutComponent,
    LucideHistory,
    LucideInfo,
  ],
  templateUrl: './document-logs-dialog.component.html',
})
export class DocumentLogsDialogComponent implements OnInit {
  private documentsService = inject(DocumentsService);
  private swalService = inject(SwalService);

  document!: Document;
  logs = signal<DocumentAccessLog[]>([]);

  // Signals for state management (compliant with the rule)
  loading = signal(false);

  constructor(
    public dialogRef: MatDialogRef<DocumentLogsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: Document }
  ) {
    if (data && data.document) {
      this.document = data.document;
    }
  }

  ngOnInit(): void {
    if (this.document) {
      this.fetchLogs();
    }
  }

  fetchLogs(): void {
    this.loading.set(true);
    this.documentsService.getAccessLogs(this.document.id).subscribe({
      next: (res) => {
        this.logs.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load document access logs.');
      },
    });
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'view':
        return 'Viewed Inline';
      case 'download':
        return 'Downloaded File';
      case 'version_uploaded':
        return 'New Version Uploaded';
      default:
        return action;
    }
  }

  getActionColorClass(action: string): string {
    switch (action) {
      case 'view':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'download':
        return 'bg-green-50 text-green-700 border-green-150';
      case 'version_uploaded':
        return 'bg-amber-50 text-amber-700 border-amber-150';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
