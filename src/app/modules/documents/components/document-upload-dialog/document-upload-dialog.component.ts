import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { LookupsService } from '@modules/administration/services/lookups.service';
import { DocumentsService } from '../../services/documents.service';
import { SwalService } from '@shared/services/swal.service';
import { Document, DocumentType } from '../../models/document.model';
import { LucideUpload, LucideFile } from '@lucide/angular';

@Component({
  selector: 'app-document-upload-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    DialogLayoutComponent,
    LucideUpload,
    LucideFile,
  ],
  templateUrl: './document-upload-dialog.component.html',
})
export class DocumentUploadDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lookupsService = inject(LookupsService);
  private documentsService = inject(DocumentsService);
  private swalService = inject(SwalService);

  form!: FormGroup;
  selectedFile: File | null = null;
  documentTypes = signal<DocumentType[]>([]);

  // Signals for component states (compliant with the rule)
  loading = signal(false);
  submitting = signal(false);

  // If passed, we are uploading a new version of an existing document
  existingDocument: Document | null = null;

  constructor(
    public dialogRef: MatDialogRef<DocumentUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document?: Document; entity_type?: string; entity_id?: string }
  ) {
    if (data && data.document) {
      this.existingDocument = data.document;
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (!this.existingDocument) {
      this.loadDocumentTypes();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      document_type_id: [this.existingDocument?.document_type_id || '', !this.existingDocument ? [Validators.required] : []],
      entity_type: [this.data?.entity_type || this.existingDocument?.entity_type || 'General'],
      entity_id: [this.data?.entity_id || this.existingDocument?.entity_id || ''],
    });
  }

  loadDocumentTypes(): void {
    this.loading.set(true);
    this.lookupsService.getItems('document-types').subscribe({
      next: (res) => {
        this.documentTypes.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load document types lookups.');
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Limit to 50MB (matching backend validation)
      if (file.size > 51200 * 1024) {
        this.swalService.error('File size exceeds the 50MB maximum limit.');
        return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.swalService.error('Please select a file to upload.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    if (this.existingDocument) {
      // Upload new version
      this.documentsService
        .uploadVersion(this.existingDocument.id, this.selectedFile)
        .subscribe({
          next: (res) => {
            this.submitting.set(false);
            if (res.success) {
              this.swalService.success('New version uploaded successfully.');
              this.dialogRef.close(true);
            }
          },
          error: (err) => {
            this.submitting.set(false);
            const msg = err?.error?.message || err?.message || 'Failed to upload new version.';
            this.swalService.error(msg);
          },
        });
    } else {
      // Upload new document
      const metadata = this.form.value;
      this.documentsService
        .uploadDocument(this.selectedFile, metadata)
        .subscribe({
          next: (res) => {
            this.submitting.set(false);
            if (res.success) {
              this.swalService.success('Document uploaded successfully.');
              this.dialogRef.close(true);
            }
          },
          error: (err) => {
            this.submitting.set(false);
            const msg = err?.error?.message || err?.message || 'Failed to upload document.';
            this.swalService.error(msg);
          },
        });
    }
  }
}
