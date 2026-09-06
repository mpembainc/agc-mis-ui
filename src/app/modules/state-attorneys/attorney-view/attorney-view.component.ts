import { Component, inject, OnInit, signal, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StateAttorneysService } from '../services/state-attorneys.service';
import { AttorneyAssignmentsService } from '../services/attorney-assignments.service';
import { AccomplishmentsService } from '../services/accomplishments.service';
import { QualificationsDossierService } from '../services/qualifications-dossier.service';
import {
  StateAttorney,
  Mda,
  Grade,
  AttorneyAssignment,
  Accomplishment,
  AccomplishmentType,
  AccomplishmentStats,
  AttorneyEducation,
  AttorneyCertification,
  DossierDocument,
  DocumentTypeLookup,
  QualificationsSummary,
  DossierSummary,
} from '../models/state-attorney.model';
import { SwalService } from '@shared/services/swal.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { RemoveUnderscorePipe } from '@shared/pipes/remove-underscore.pipe';
import { HeaderComponent } from '@shared/components/header/header.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { DetailItemComponent } from '@shared/components/detail-item/detail-item.component';
import {
  LucideShieldCheck,
  LucideLandmark,
  LucideUser,
  LucideBriefcase,
  LucideIdCard,
  LucidePhone,
  LucideFolderKanban,
  LucidePencil,
  LucideCamera,
  LucideLoader2,
  LucideEye,
  LucideX,
  LucideExternalLink,
  LucidePlus,
  LucideCheckCircle2,
  LucideClock,
  LucideTrash2,
  LucideFileText,
  LucideAward,
  LucideHash,
  LucideLayers,
  LucideGraduationCap,
  LucideUpload,
  LucideDownload,
  LucideFile,
} from '@lucide/angular';
import { toCapitalizedCase } from '@shared/utilities/utils';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';

@Component({
  selector: 'app-attorney-view',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    DialogLayoutComponent,
    DataTableComponent,
    HeaderComponent,
    BadgeComponent,
    DetailItemComponent,
    ButtonComponent,
    RemoveUnderscorePipe,
    LucideShieldCheck,
    LucideLandmark,
    LucideUser,
    LucideBriefcase,
    LucideIdCard,
    LucidePhone,
    LucideFolderKanban,
    LucideCamera,
    LucideLoader2,
    LucideEye,
    LucideX,
    LucidePlus,
    LucideCheckCircle2,
    LucideClock,
    LucideTrash2,
    LucideFileText,
    LucideAward,
    LucideHash,
    LucideLayers,
    LucideGraduationCap,
    LucideUpload,
    LucideDownload,
    LucideFile,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './attorney-view.component.html',
  styleUrls: ['./attorney-view.component.scss'],
})
export class AttorneyViewComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('previewDialog') previewDialogTpl!: TemplateRef<any>;
  @ViewChild('assignWorkDialog') assignWorkDialogTpl!: TemplateRef<any>;
  @ViewChild('viewAssignmentDialog') viewAssignmentDialogTpl!: TemplateRef<any>;
  @ViewChild('logAccomplishmentDialog') logAccomplishmentDialogTpl!: TemplateRef<any>;
  @ViewChild('viewAccomplishmentDialog') viewAccomplishmentDialogTpl!: TemplateRef<any>;
  @ViewChild('educationDialog') educationDialogTpl!: TemplateRef<any>;
  @ViewChild('viewEducationDialog') viewEducationDialogTpl!: TemplateRef<any>;
  @ViewChild('certificationDialog') certificationDialogTpl!: TemplateRef<any>;
  @ViewChild('viewCertificationDialog') viewCertificationDialogTpl!: TemplateRef<any>;
  @ViewChild('uploadDossierDialog') uploadDossierDialogTpl!: TemplateRef<any>;
  @ViewChild('viewDossierDialog') viewDossierDialogTpl!: TemplateRef<any>;

  protected readonly editIcon = LucidePencil;
  protected readonly cameraIcon = LucideCamera;
  protected readonly eyeIcon = LucideEye;
  protected readonly closeIcon = LucideX;
  protected readonly externalLinkIcon = LucideExternalLink;
  protected readonly plusIcon = LucidePlus;
  protected readonly checkCircleIcon = LucideCheckCircle2;
  protected readonly clockIcon = LucideClock;
  protected readonly trashIcon = LucideTrash2;
  protected readonly fileTextIcon = LucideFileText;
  protected readonly awardIcon = LucideAward;
  protected readonly hashIcon = LucideHash;
  protected readonly layersIcon = LucideLayers;
  protected readonly graduationCapIcon = LucideGraduationCap;
  protected readonly uploadIcon = LucideUpload;
  protected readonly downloadIcon = LucideDownload;
  protected readonly fileIcon = LucideFile;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(StateAttorneysService);
  private assignmentsService = inject(AttorneyAssignmentsService);
  private accomplishmentsService = inject(AccomplishmentsService);
  private qualificationsService = inject(QualificationsDossierService);
  private swalService = inject(SwalService);
  private dialog = inject(MatDialog);

  attorney: StateAttorney | null = null;
  loading = signal(false);
  uploadingAvatar = signal(false);
  avatarError = signal(false);
  activeTab = 'profile';

  // Accomplishments state
  accomplishments = signal<Accomplishment[]>([]);
  accomplishmentTypes = signal<AccomplishmentType[]>([]);
  accomplishmentStats = signal<AccomplishmentStats | null>(null);
  loadingAccomplishments = signal(false);
  savingAccomplishment = signal(false);
  selectedAccomplishment = signal<Accomplishment | null>(null);
  private logAccomplishmentDialogRef: MatDialogRef<any> | null = null;
  private viewAccomplishmentDialogRef: MatDialogRef<any> | null = null;

  accomplishmentForm = {
    type_id: '',
    entity_type: 'contract',
    entity_id: '',
    quantity: 1,
    date: new Date().toISOString().split('T')[0] as any,
    description: '',
  };

  accomplishmentColumns: TableColumn[] = [
    { key: 'date', label: 'Output Date', type: 'date' },
    { key: 'type', label: 'Deliverable Type' },
    { key: 'matter', label: 'Related Matter' },
    { key: 'description', label: 'Description & Scope' },
    { key: 'quantity', label: 'Units' },
  ];

  // Qualifications & Credentials state (IMP-SA-05)
  educationList = signal<AttorneyEducation[]>([]);
  certificationsList = signal<AttorneyCertification[]>([]);
  qualificationsSummary = signal<QualificationsSummary | null>(null);
  loadingQualifications = signal(false);
  savingEducation = signal(false);
  savingCertification = signal(false);
  selectedEducation = signal<AttorneyEducation | null>(null);
  selectedCertification = signal<AttorneyCertification | null>(null);
  private educationDialogRef: MatDialogRef<any> | null = null;
  private viewEducationDialogRef: MatDialogRef<any> | null = null;
  private certificationDialogRef: MatDialogRef<any> | null = null;
  private viewCertificationDialogRef: MatDialogRef<any> | null = null;

  educationLevels = [
    'Certificate',
    'Diploma',
    'Post-Graduate Diploma',
    'Bachelor Degree',
    'Master Degree',
    'Doctorate (PhD)',
  ];

  educationForm = {
    institution_name: '',
    education_level: 'Bachelor Degree',
    degree: '',
    graduation_year: new Date().getFullYear(),
    certificate_file: null as File | null,
  };

  certificationForm = {
    certification_name: '',
    issuing_body: '',
    issue_date: '' as any,
    expiry_date: '' as any,
    is_active: true,
    certificate_file: null as File | null,
  };

  educationColumns: TableColumn[] = [
    { key: 'degree', label: 'Degree & Programme' },
    { key: 'institution_name', label: 'Institution' },
    { key: 'education_level', label: 'Level' },
    { key: 'graduation_year', label: 'Graduation Year' },
    { key: 'certificate', label: 'Certificate' },
    { key: 'is_verified', label: 'Status' },
  ];

  certificationColumns: TableColumn[] = [
    { key: 'certification_name', label: 'Certification / Admission' },
    { key: 'issuing_body', label: 'Issuing Authority' },
    { key: 'issue_date', label: 'Issue Date', type: 'date' },
    { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
    { key: 'is_active', label: 'Status' },
    { key: 'certificate', label: 'Attachment' },
  ];

  // Digital Dossier state (IMP-SA-05)
  dossierDocuments = signal<DossierDocument[]>([]);
  documentTypes = signal<DocumentTypeLookup[]>([]);
  dossierSummary = signal<DossierSummary | null>(null);
  loadingDossier = signal(false);
  uploadingDossier = signal(false);
  selectedDossierDoc = signal<DossierDocument | null>(null);
  private uploadDossierDialogRef: MatDialogRef<any> | null = null;
  private viewDossierDialogRef: MatDialogRef<any> | null = null;

  dossierForm = {
    document_type_id: '',
    is_cv: false,
    file: null as File | null,
  };

  dossierColumns: TableColumn[] = [
    { key: 'original_name', label: 'Document Name' },
    { key: 'category', label: 'Category' },
    { key: 'size_bytes', label: 'File Size' },
    { key: 'created_at', label: 'Uploaded On', type: 'date' },
    { key: 'uploaded_by', label: 'Uploaded By' },
  ];

  private previewDialogRef: MatDialogRef<any> | null = null;
  private assignDialogRef: MatDialogRef<any> | null = null;
  private viewDialogRef: MatDialogRef<any> | null = null;
  selectedAssignment: AttorneyAssignment | null = null;

  assignLoading = signal(false);
  contractsLoading = signal(false);
  availableContracts = signal<any[]>([]);

  assignmentColumns: TableColumn[] = [
    { key: 'entity_type', label: 'Type', generated: (row) => row.entity_type.toUpperCase() },
    { key: 'reference_number', label: 'Reference Number' },
    { key: 'role', label: 'Role' },
    { key: 'start_date', label: 'Start Date', type: 'date' },
    { key: 'end_date', label: 'End Date', type: 'date' },
    { key: 'status', label: 'Status' },
  ];

  rolesList = [
    'Lead Reviewer',
    'Co-Counsel',
    'Legal Advisor',
    'Drafter',
    'Litigator',
    'Committee Member',
  ];

  entityTypes = [
    { label: 'Contract Review', value: 'contract' },
    { label: 'Litigation Case', value: 'case' },
    { label: 'Legal Advisory', value: 'advisory' },
    { label: 'Special Project', value: 'project' },
    { label: 'Committee / Taskforce', value: 'committee' },
  ];

  assignForm = {
    entity_type: 'contract' as 'contract' | 'case' | 'project' | 'committee' | 'advisory',
    entity_id: '',
    custom_title: '',
    role: 'Lead Reviewer',
    start_date: new Date().toISOString().split('T')[0] as any,
    end_date: '' as any,
    notes: '',
  };

  mdas: Mda[] = [];
  grades: Grade[] = [];

  ngOnInit(): void {
    this.loadLookups();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAttorneyDetails(id);
    } else {
      this.router.navigate(['/state-attorneys']);
    }
  }

  loadLookups(): void {
    this.service.getMdas().subscribe({
      next: (res) => (this.mdas = res.data),
    });

    this.service.getGrades().subscribe({
      next: (res) => (this.grades = res.data),
    });
  }

  loadAttorneyDetails(id: string): void {
    this.loading.set(true);
    this.service.getAttorney(id).subscribe({
      next: (res) => {
        this.attorney = res.data;
        if (res.data.accomplishments) {
          this.accomplishments.set(res.data.accomplishments);
        }
        if (res.data.education) {
          this.educationList.set(res.data.education);
        }
        if (res.data.certifications) {
          this.certificationsList.set(res.data.certifications);
        }
        if (res.data.dossier_documents) {
          this.dossierDocuments.set(res.data.dossier_documents);
        }
        this.loading.set(false);
        this.loadAccomplishmentData(id);
        this.loadQualificationsData(id);
        this.loadDossierData(id);
        this.loadDocumentTypes();
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load State Attorney details.');
        this.router.navigate(['/state-attorneys']);
      },
    });
  }

  getMdaName(id?: string | null): string {
    if (!id) return '-';
    const mda = this.mdas.find((m) => m.id === id);
    return mda ? `${mda.code} - ${mda.name}` : '-';
  }

  getGradeName(id?: string | null): string {
    if (!id) return '-';
    const grade = this.grades.find((g) => g.id === id);
    return grade ? grade.grade_name : '-';
  }

  getFormattedDob(dob?: string | null): string {
    if (!dob) return '-';
    try {
      const date = new Date(dob);
      if (isNaN(date.getTime())) return dob;
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dob;
    }
  }

  getStatusVariant(status?: string | null): BadgeVariant {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'on_leave':
        return 'warning';
      case 'suspended':
        return 'danger';
      case 'seconded':
        return 'info';
      case 'resigned':
      case 'retired':
      case 'deceased':
        return 'neutral';
      default:
        return 'secondary';
    }
  }

  getAssignmentStatusVariant(status?: string | null): BadgeVariant {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'closed':
        return 'success';
      case 'in_progress':
      case 'active':
        return 'warning';
      case 'pending':
        return 'primary';
      default:
        return 'secondary';
    }
  }

  getInitials(name?: string | null): string {
    if (!name) return 'SA';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      this.swalService.error('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      input.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.swalService.error('Image size must be less than 5MB.');
      input.value = '';
      return;
    }

    if (!this.attorney?.id) return;

    this.uploadingAvatar.set(true);

    this.service.uploadAvatar(this.attorney.id, file).subscribe({
      next: (res) => {
        this.uploadingAvatar.set(false);
        this.avatarError.set(false);
        if (res.data) {
          const updated = res.data;
          // Bust browser cache for the newly uploaded avatar
          if (updated.avatar_url) {
            const separator = updated.avatar_url.includes('?') ? '&' : '?';
            updated.avatar_url = `${updated.avatar_url}${separator}t=${Date.now()}`;
          }
          this.attorney = updated;
        }
        this.swalService.success('Profile photo updated successfully.');
        input.value = '';
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        const msg = err.error?.message || 'Failed to upload profile photo.';
        this.swalService.error(msg);
        input.value = '';
      },
    });
  }

  onAvatarError(): void {
    this.avatarError.set(true);
  }

  openPreview(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.attorney?.avatar_url || this.avatarError()) return;

    this.previewDialogRef = this.dialog.open(this.previewDialogTpl, {
      maxWidth: '92vw',
      maxHeight: '92vh',
      panelClass: 'image-preview-dialog-panel',
      autoFocus: false,
    });
  }

  closePreview(): void {
    if (this.previewDialogRef) {
      this.previewDialogRef.close();
      this.previewDialogRef = null;
    }
    this.dialog.closeAll();
  }

  onAvatarContainerClick(event: MouseEvent): void {
    if (this.attorney?.avatar_url && !this.avatarError() && !this.uploadingAvatar()) {
      this.openPreview(event);
    }
  }

  openInNewTab(): void {
    if (this.attorney?.avatar_url) {
      window.open(this.attorney.avatar_url, '_blank');
    }
  }

  triggerFileInput(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.fileInputRef?.nativeElement?.click();
  }

  formatName(name?: string | null): string {
    return toCapitalizedCase(name || '');
  }

  openAssignWorkDialog(): void {
    this.assignForm = {
      entity_type: 'contract',
      entity_id: '',
      custom_title: '',
      role: 'Lead Reviewer',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: '',
    };
    this.loadAvailableContracts();
    this.assignDialogRef = this.dialog.open(this.assignWorkDialogTpl, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'assign-work-dialog-panel',
      autoFocus: false,
    });
  }

  closeAssignDialog(): void {
    if (this.assignDialogRef) {
      this.assignDialogRef.close();
      this.assignDialogRef = null;
    }
  }

  loadAvailableContracts(): void {
    if (this.availableContracts().length > 0) return;
    this.contractsLoading.set(true);
    this.assignmentsService.getAvailableContracts().subscribe({
      next: (res) => {
        this.contractsLoading.set(false);
        const data = res.data?.data || res.data || [];
        this.availableContracts.set(Array.isArray(data) ? data : []);
      },
      error: () => {
        this.contractsLoading.set(false);
      },
    });
  }

  saveAssignment(): void {
    if (!this.attorney?.id) return;

    if (this.assignForm.entity_type === 'contract' && !this.assignForm.entity_id) {
      this.swalService.error('Please select a contract to assign.');
      return;
    }

    if (this.assignForm.entity_type !== 'contract' && !this.assignForm.custom_title?.trim()) {
      this.swalService.error('Please enter the matter / task title or reference.');
      return;
    }

    this.assignLoading.set(true);

    const formatDate = (val: any) => {
      if (!val) return undefined;
      if (val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return typeof val === 'string' && val.length > 10 ? val.substring(0, 10) : val;
    };

    const payload: Partial<AttorneyAssignment> = {
      attorney_id: this.attorney.id,
      entity_type: this.assignForm.entity_type,
      role: this.assignForm.role,
      start_date: formatDate(this.assignForm.start_date),
      end_date: formatDate(this.assignForm.end_date),
      notes: this.assignForm.entity_type === 'contract' 
        ? this.assignForm.notes 
        : (this.assignForm.custom_title + (this.assignForm.notes ? ' - ' + this.assignForm.notes : '')),
      status: 'active',
    };

    if (this.assignForm.entity_type === 'contract') {
      payload.entity_id = this.assignForm.entity_id;
    }

    this.assignmentsService.createAssignment(payload).subscribe({
      next: () => {
        this.assignLoading.set(false);
        this.closeAssignDialog();
        this.swalService.success('Work assignment allocated successfully.');
        if (this.attorney?.id) {
          this.loadAttorneyDetails(this.attorney.id);
        }
      },
      error: (err) => {
        this.assignLoading.set(false);
        const msg = err.error?.message || 'Failed to assign work. Please try again.';
        this.swalService.error(msg);
      },
    });
  }

  onViewAssignment(assign: AttorneyAssignment): void {
    this.selectedAssignment = assign;
    this.viewDialogRef = this.dialog.open(this.viewAssignmentDialogTpl, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'view-assignment-dialog-panel',
      autoFocus: false,
    });
  }

  closeViewDialog(): void {
    if (this.viewDialogRef) {
      this.viewDialogRef.close();
      this.viewDialogRef = null;
    }
  }

  async onToggleAssignmentStatus(assign: AttorneyAssignment): Promise<void> {
    const nextStatus = assign.status === 'completed' ? 'active' : 'completed';
    const actionLabel = nextStatus === 'completed' ? 'Mark Completed' : 'Reopen';
    const result = await this.swalService.confirm(
      `Are you sure you want to mark this assignment as ${nextStatus}?`,
      `${actionLabel} Assignment`,
      `Yes, ${actionLabel}`
    );

    if (result?.isConfirmed) {
      this.assignmentsService.updateAssignment(assign.id, { status: nextStatus }).subscribe({
        next: () => {
          this.swalService.successToast(`Assignment marked as ${nextStatus}.`);
          if (this.attorney?.id) {
            this.loadAttorneyDetails(this.attorney.id);
          }
        },
        error: () => this.swalService.error('Failed to update assignment status.'),
      });
    }
  }

  async onDeleteAssignment(assign: AttorneyAssignment): Promise<void> {
    const result = await this.swalService.confirm(
      'Are you sure you want to unassign this work? This will remove the case allocation for this attorney.',
      'Unassign Work',
      'Yes, Unassign'
    );

    if (result?.isConfirmed) {
      this.assignmentsService.deleteAssignment(assign.id).subscribe({
        next: () => {
          this.swalService.successToast('Assignment removed successfully.');
          if (this.attorney?.id) {
            this.loadAttorneyDetails(this.attorney.id);
          }
        },
        error: () => this.swalService.error('Failed to remove assignment.'),
      });
    }
  }

  getEntityTypeVariant(type?: string | null): BadgeVariant {
    switch (type?.toLowerCase()) {
      case 'contract':
        return 'primary';
      case 'case':
        return 'warning';
      case 'advisory':
        return 'info';
      case 'project':
        return 'purple';
      case 'committee':
        return 'neutral';
      default:
        return 'secondary';
    }
  }

  formatEntityType(type?: string | null): string {
    switch (type?.toLowerCase()) {
      case 'contract':
        return 'Contract';
      case 'case':
        return 'Litigation';
      case 'advisory':
        return 'Advisory';
      case 'project':
        return 'Project';
      case 'committee':
        return 'Committee';
      default:
        return type ? toCapitalizedCase(type) : 'General';
    }
  }

  // ── Accomplishments & Task Outputs Methods ──

  loadAccomplishmentData(attorneyId: string): void {
    this.loadingAccomplishments.set(true);
    this.accomplishmentsService.getAccomplishments({ attorney_id: attorneyId, per_page: 100 }).subscribe({
      next: (res) => {
        this.accomplishments.set(res.data.data || []);
        this.loadingAccomplishments.set(false);
      },
      error: () => {
        this.loadingAccomplishments.set(false);
      },
    });

    this.accomplishmentsService.getAccomplishmentTypes().subscribe({
      next: (res) => {
        this.accomplishmentTypes.set(res.data || []);
      },
    });

    this.accomplishmentsService.getAccomplishmentStats(attorneyId).subscribe({
      next: (res) => {
        this.accomplishmentStats.set(res.data);
      },
    });
  }

  openLogAccomplishmentDialog(): void {
    this.accomplishmentForm = {
      type_id: this.accomplishmentTypes().length ? this.accomplishmentTypes()[0].id : '',
      entity_type: 'contract',
      entity_id: '',
      quantity: 1,
      date: new Date().toISOString().split('T')[0] as any,
      description: '',
    };

    if (this.availableContracts().length === 0) {
      this.loadAvailableContracts();
    }

    this.logAccomplishmentDialogRef = this.dialog.open(this.logAccomplishmentDialogTpl, {
      width: '560px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
    });
  }

  closeLogAccomplishmentDialog(): void {
    this.logAccomplishmentDialogRef?.close();
    this.logAccomplishmentDialogRef = null;
  }

  saveAccomplishment(): void {
    if (!this.attorney?.id) return;

    if (!this.accomplishmentForm.type_id) {
      this.swalService.error('Please select an accomplishment type.');
      return;
    }

    if (!this.accomplishmentForm.description?.trim()) {
      this.swalService.error('Please provide a description or deliverable scope.');
      return;
    }

    if (!this.accomplishmentForm.date) {
      this.swalService.error('Please select the date of completion.');
      return;
    }

    const payload: Partial<Accomplishment> = {
      attorney_id: this.attorney.id,
      type_id: this.accomplishmentForm.type_id,
      entity_type: this.accomplishmentForm.entity_type,
      entity_id: this.accomplishmentForm.entity_id || null,
      quantity: Number(this.accomplishmentForm.quantity) || 1,
      date: this.accomplishmentForm.date,
      description: this.accomplishmentForm.description.trim(),
    };

    this.savingAccomplishment.set(true);
    this.accomplishmentsService.createAccomplishment(payload).subscribe({
      next: () => {
        this.savingAccomplishment.set(false);
        this.swalService.successToast('Accomplishment recorded successfully.');
        this.closeLogAccomplishmentDialog();
        if (this.attorney?.id) {
          this.loadAccomplishmentData(this.attorney.id);
        }
      },
      error: (err) => {
        this.savingAccomplishment.set(false);
        const msg = err.error?.message || 'Failed to record accomplishment.';
        this.swalService.error(msg);
      },
    });
  }

  onViewAccomplishment(row: Accomplishment): void {
    this.selectedAccomplishment.set(row);
    this.viewAccomplishmentDialogRef = this.dialog.open(this.viewAccomplishmentDialogTpl, {
      width: '540px',
      panelClass: 'custom-dialog-container',
    });
  }

  closeViewAccomplishmentDialog(): void {
    this.viewAccomplishmentDialogRef?.close();
    this.viewAccomplishmentDialogRef = null;
    this.selectedAccomplishment.set(null);
  }

  async onDeleteAccomplishment(item: Accomplishment): Promise<void> {
    const result = await this.swalService.confirm(
      'Are you sure you want to delete this recorded accomplishment output?',
      'Delete Accomplishment',
      'Yes, Delete'
    );

    if (result?.isConfirmed) {
      this.accomplishmentsService.deleteAccomplishment(item.id).subscribe({
        next: () => {
          this.swalService.successToast('Accomplishment deleted successfully.');
          if (this.attorney?.id) {
            this.loadAccomplishmentData(this.attorney.id);
          }
        },
        error: () => this.swalService.error('Failed to delete accomplishment.'),
      });
    }
  }

  getAccomplishmentTypeBadgeVariant(typeName?: string | null): BadgeVariant {
    const lower = typeName?.toLowerCase() || '';
    if (lower.includes('advice') || lower.includes('opinion')) return 'primary';
    if (lower.includes('contract') || lower.includes('vetting')) return 'success';
    if (lower.includes('court') || lower.includes('litigation')) return 'warning';
    if (lower.includes('bill') || lower.includes('drafting')) return 'purple';
    if (lower.includes('committee') || lower.includes('taskforce')) return 'neutral';
    return 'secondary';
  }

  // ── Qualifications & Digital Dossier Methods (IMP-SA-05) ──

  loadQualificationsData(attorneyId: string): void {
    this.loadingQualifications.set(true);
    this.qualificationsService.getQualifications(attorneyId).subscribe({
      next: (res) => {
        this.educationList.set(res.data.education || []);
        this.certificationsList.set(res.data.certifications || []);
        this.qualificationsSummary.set(res.data.summary);
        this.loadingQualifications.set(false);
      },
      error: () => this.loadingQualifications.set(false),
    });
  }

  loadDossierData(attorneyId: string): void {
    this.loadingDossier.set(true);
    this.qualificationsService.getDossier(attorneyId).subscribe({
      next: (res) => {
        this.dossierDocuments.set(res.data.documents || []);
        this.dossierSummary.set(res.data.summary);
        this.loadingDossier.set(false);
      },
      error: () => this.loadingDossier.set(false),
    });
  }

  loadDocumentTypes(): void {
    if (this.documentTypes().length > 0) return;
    this.qualificationsService.getDocumentTypes().subscribe({
      next: (res) => this.documentTypes.set(res.data || []),
    });
  }

  // Academic Education Handlers
  openAddEducationDialog(): void {
    this.educationForm = {
      institution_name: '',
      education_level: 'Bachelor Degree',
      degree: '',
      graduation_year: new Date().getFullYear(),
      certificate_file: null,
    };
    this.educationDialogRef = this.dialog.open(this.educationDialogTpl, {
      width: '560px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
    });
  }

  closeEducationDialog(): void {
    this.educationDialogRef?.close();
    this.educationDialogRef = null;
  }

  onEducationFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.educationForm.certificate_file = input.files[0];
    }
  }

  saveEducation(): void {
    if (!this.attorney?.id) return;
    if (!this.educationForm.degree?.trim()) {
      this.swalService.error('Please enter the degree or programme title.');
      return;
    }
    if (!this.educationForm.institution_name?.trim()) {
      this.swalService.error('Please enter the educational institution name.');
      return;
    }
    if (!this.educationForm.graduation_year) {
      this.swalService.error('Please enter a valid graduation year.');
      return;
    }

    const formData = new FormData();
    formData.append('degree', this.educationForm.degree.trim());
    formData.append('institution_name', this.educationForm.institution_name.trim());
    formData.append('education_level', this.educationForm.education_level);
    formData.append('graduation_year', String(this.educationForm.graduation_year));
    if (this.educationForm.certificate_file) {
      formData.append('certificate_file', this.educationForm.certificate_file);
    }

    this.savingEducation.set(true);
    this.qualificationsService.addEducation(this.attorney.id, formData).subscribe({
      next: () => {
        this.savingEducation.set(false);
        this.swalService.successToast('Academic qualification added successfully.');
        this.closeEducationDialog();
        if (this.attorney?.id) {
          this.loadQualificationsData(this.attorney.id);
          this.loadDossierData(this.attorney.id);
        }
      },
      error: (err) => {
        this.savingEducation.set(false);
        this.swalService.error(err.error?.message || 'Failed to add academic qualification.');
      },
    });
  }

  onViewEducation(row: AttorneyEducation): void {
    this.selectedEducation.set(row);
    this.viewEducationDialogRef = this.dialog.open(this.viewEducationDialogTpl, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
    });
  }

  closeViewEducationDialog(): void {
    this.viewEducationDialogRef?.close();
    this.viewEducationDialogRef = null;
    this.selectedEducation.set(null);
  }

  async onVerifyEducation(item: AttorneyEducation): Promise<void> {
    if (!this.attorney?.id) return;
    const targetStatus = !item.is_verified;
    const action = targetStatus ? 'Verify' : 'Unverify';
    const result = await this.swalService.confirm(
      `Are you sure you want to ${action.toLowerCase()} this academic qualification?`,
      `${action} Qualification`,
      `Yes, ${action}`
    );

    if (result?.isConfirmed) {
      this.qualificationsService.verifyEducation(this.attorney.id, item.id, targetStatus).subscribe({
        next: () => {
          this.swalService.successToast(`Qualification ${action.toLowerCase()}ed successfully.`);
          if (this.attorney?.id) {
            this.loadQualificationsData(this.attorney.id);
          }
          if (this.selectedEducation()) {
            this.selectedEducation.update((prev) => (prev ? { ...prev, is_verified: targetStatus } : null));
          }
        },
        error: (err) => this.swalService.error(err.error?.message || 'Failed to update verification status.'),
      });
    }
  }

  async onDeleteEducation(item: AttorneyEducation): Promise<void> {
    if (!this.attorney?.id) return;
    const result = await this.swalService.confirm(
      'Are you sure you want to delete this academic qualification?',
      'Delete Qualification',
      'Yes, Delete'
    );

    if (result?.isConfirmed) {
      this.qualificationsService.deleteEducation(this.attorney.id, item.id).subscribe({
        next: () => {
          this.swalService.successToast('Academic qualification deleted successfully.');
          if (this.attorney?.id) {
            this.loadQualificationsData(this.attorney.id);
          }
        },
        error: () => this.swalService.error('Failed to delete qualification.'),
      });
    }
  }

  // Professional Certification Handlers
  openAddCertificationDialog(): void {
    this.certificationForm = {
      certification_name: '',
      issuing_body: '',
      issue_date: '' as any,
      expiry_date: '' as any,
      is_active: true,
      certificate_file: null,
    };
    this.certificationDialogRef = this.dialog.open(this.certificationDialogTpl, {
      width: '560px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
    });
  }

  closeCertificationDialog(): void {
    this.certificationDialogRef?.close();
    this.certificationDialogRef = null;
  }

  onCertificationFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.certificationForm.certificate_file = input.files[0];
    }
  }

  saveCertification(): void {
    if (!this.attorney?.id) return;
    if (!this.certificationForm.certification_name?.trim()) {
      this.swalService.error('Please enter the certification or bar admission title.');
      return;
    }

    const formatDate = (val: any) => {
      if (!val) return '';
      if (val instanceof Date) {
        return val.toISOString().split('T')[0];
      }
      return typeof val === 'string' && val.length > 10 ? val.substring(0, 10) : val;
    };

    const formData = new FormData();
    formData.append('certification_name', this.certificationForm.certification_name.trim());
    if (this.certificationForm.issuing_body?.trim()) {
      formData.append('issuing_body', this.certificationForm.issuing_body.trim());
    }
    if (this.certificationForm.issue_date) {
      formData.append('issue_date', formatDate(this.certificationForm.issue_date));
    }
    if (this.certificationForm.expiry_date) {
      formData.append('expiry_date', formatDate(this.certificationForm.expiry_date));
    }
    formData.append('is_active', this.certificationForm.is_active ? '1' : '0');
    if (this.certificationForm.certificate_file) {
      formData.append('certificate_file', this.certificationForm.certificate_file);
    }

    this.savingCertification.set(true);
    this.qualificationsService.addCertification(this.attorney.id, formData).subscribe({
      next: () => {
        this.savingCertification.set(false);
        this.swalService.successToast('Professional certification recorded successfully.');
        this.closeCertificationDialog();
        if (this.attorney?.id) {
          this.loadQualificationsData(this.attorney.id);
          this.loadDossierData(this.attorney.id);
        }
      },
      error: (err) => {
        this.savingCertification.set(false);
        this.swalService.error(err.error?.message || 'Failed to add professional certification.');
      },
    });
  }

  onViewCertification(row: AttorneyCertification): void {
    this.selectedCertification.set(row);
    this.viewCertificationDialogRef = this.dialog.open(this.viewCertificationDialogTpl, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
    });
  }

  closeViewCertificationDialog(): void {
    this.viewCertificationDialogRef?.close();
    this.viewCertificationDialogRef = null;
    this.selectedCertification.set(null);
  }

  async onDeleteCertification(item: AttorneyCertification): Promise<void> {
    if (!this.attorney?.id) return;
    const result = await this.swalService.confirm(
      'Are you sure you want to delete this professional certification?',
      'Delete Certification',
      'Yes, Delete'
    );

    if (result?.isConfirmed) {
      this.qualificationsService.deleteCertification(this.attorney.id, item.id).subscribe({
        next: () => {
          this.swalService.successToast('Professional certification deleted successfully.');
          if (this.attorney?.id) {
            this.loadQualificationsData(this.attorney.id);
          }
        },
        error: () => this.swalService.error('Failed to delete certification.'),
      });
    }
  }

  // Digital Dossier Handlers
  openUploadDossierDialog(): void {
    this.loadDocumentTypes();
    this.dossierForm = {
      document_type_id: this.documentTypes().length > 0 ? this.documentTypes()[0].id : '',
      is_cv: false,
      file: null,
    };
    this.uploadDossierDialogRef = this.dialog.open(this.uploadDossierDialogTpl, {
      width: '560px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
    });
  }

  closeUploadDossierDialog(): void {
    this.uploadDossierDialogRef?.close();
    this.uploadDossierDialogRef = null;
  }

  onDossierFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.dossierForm.file = input.files[0];
    }
  }

  saveDossierDocument(): void {
    if (!this.attorney?.id) return;
    if (!this.dossierForm.file) {
      this.swalService.error('Please choose a file to upload to the dossier.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.dossierForm.file);
    if (this.dossierForm.document_type_id) {
      formData.append('document_type_id', this.dossierForm.document_type_id);
    }
    if (this.dossierForm.is_cv) {
      formData.append('is_cv', '1');
    }

    this.uploadingDossier.set(true);
    this.qualificationsService.uploadDossierDocument(this.attorney.id, formData).subscribe({
      next: () => {
        this.uploadingDossier.set(false);
        this.swalService.successToast('Document uploaded to digital dossier.');
        this.closeUploadDossierDialog();
        if (this.attorney?.id) {
          this.loadDossierData(this.attorney.id);
        }
      },
      error: (err) => {
        this.uploadingDossier.set(false);
        this.swalService.error(err.error?.message || 'Failed to upload document.');
      },
    });
  }

  onViewDossierDoc(row: DossierDocument): void {
    this.selectedDossierDoc.set(row);
    this.viewDossierDialogRef = this.dialog.open(this.viewDossierDialogTpl, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'custom-dialog-container',
    });
  }

  closeViewDossierDialog(): void {
    this.viewDossierDialogRef?.close();
    this.viewDossierDialogRef = null;
    this.selectedDossierDoc.set(null);
  }

  onDownloadDocument(doc?: DossierDocument | null): void {
    if (!doc?.id) return;
    this.qualificationsService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.original_name || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.swalService.error('Failed to download document file.'),
    });
  }

  onPreviewDocument(doc?: DossierDocument | null): void {
    if (!doc?.id) return;
    const url = this.qualificationsService.getDocumentViewUrl(doc.id);
    window.open(url, '_blank');
  }

  async onDeleteDossierDoc(doc: DossierDocument): Promise<void> {
    if (!this.attorney?.id) return;
    const result = await this.swalService.confirm(
      `Are you sure you want to delete "${doc.original_name}" from the digital dossier?`,
      'Delete Document',
      'Yes, Delete'
    );

    if (result?.isConfirmed) {
      this.qualificationsService.deleteDossierDocument(this.attorney.id, doc.id).subscribe({
        next: () => {
          this.swalService.successToast('Document removed from digital dossier.');
          if (this.attorney?.id) {
            this.loadDossierData(this.attorney.id);
          }
        },
        error: () => this.swalService.error('Failed to delete dossier document.'),
      });
    }
  }

  getDocumentTypeBadgeVariant(typeName?: string | null): BadgeVariant {
    const lower = typeName?.toLowerCase() || '';
    if (lower.includes('academic') || lower.includes('degree')) return 'primary';
    if (lower.includes('bar') || lower.includes('practicing')) return 'success';
    if (lower.includes('appointment') || lower.includes('gazette')) return 'warning';
    if (lower.includes('cv') || lower.includes('curriculum')) return 'purple';
    if (lower.includes('oath') || lower.includes('allegiance')) return 'neutral';
    if (lower.includes('id') || lower.includes('zanid')) return 'info';
    return 'secondary';
  }
}
