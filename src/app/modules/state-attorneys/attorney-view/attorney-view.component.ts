import { Component, inject, OnInit, signal, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StateAttorneysService } from '../services/state-attorneys.service';
import { AttorneyAssignmentsService } from '../services/attorney-assignments.service';
import { StateAttorney, Mda, Grade, AttorneyAssignment } from '../models/state-attorney.model';
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

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(StateAttorneysService);
  private assignmentsService = inject(AttorneyAssignmentsService);
  private swalService = inject(SwalService);
  private dialog = inject(MatDialog);

  attorney: StateAttorney | null = null;
  loading = signal(false);
  uploadingAvatar = signal(false);
  avatarError = signal(false);
  activeTab = 'profile';

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
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load State Attorney details.');
        this.router.navigate(['/state-attorneys']);
      },
    });
  }

  getMdaName(id?: string): string {
    if (!id) return '-';
    const mda = this.mdas.find((m) => m.id === id);
    return mda ? `${mda.code} - ${mda.name}` : '-';
  }

  getGradeName(id?: string): string {
    if (!id) return '-';
    const grade = this.grades.find((g) => g.id === id);
    return grade ? grade.grade_name : '-';
  }

  getFormattedDob(dob?: string): string {
    if (!dob) return '-';
    try {
      const date = new Date(dob);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dob;
    }
  }

  getStatusVariant(status?: string): BadgeVariant {
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

  getAssignmentStatusVariant(status?: string): BadgeVariant {
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

  getInitials(name?: string): string {
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

  formatName(name?: string): string {
    return toCapitalizedCase(name);
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

  getEntityTypeVariant(type?: string): BadgeVariant {
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

  formatEntityType(type?: string): string {
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
}
