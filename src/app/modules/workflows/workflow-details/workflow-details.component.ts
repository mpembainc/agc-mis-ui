import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WorkflowsService } from '../services/workflows.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { RolesService } from '@modules/administration/services/roles.service';
import { UsersService } from '@modules/administration/services/users.service';
import { SwalService } from '@shared/services/swal.service';
import { catchError, forkJoin, of } from 'rxjs';
import { HeaderComponent } from '@shared/components/header/header.component';
import { DetailItemComponent } from '@shared/components/detail-item/detail-item.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  LucideDynamicIcon,
  LucideCheck,
  LucideX,
  LucideClock,
  LucideIcon,
  LucideArrowLeft,
  LucideCheckCircle2,
  LucideXCircle,
  LucideSend,
} from '@lucide/angular';

interface ExtendedTask {
  id: string;
  node_name: string;
  assigned_user_id: string | null;
  role_id: string | null;
  start_time: string | null;
  end_time: string | null;
  working_days: number | null;
  is_return: boolean;
  comments: string | null;
  // Resolved UI fields
  resolved_assignee_name?: string;
  resolved_role_name?: string;
}

const CONTRACT_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted'],
  submitted: ['under_review', 'approved', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['signed', 'active'],
  rejected: ['draft', 'submitted'],
  signed: ['active'],
  active: ['completed', 'terminated'],
  completed: [],
  terminated: []
};

const LEAVE_TRANSITIONS: Record<string, string[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['cancelled'],
  rejected: [],
  cancelled: []
};

@Component({
  selector: 'app-workflow-details',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    HeaderComponent,
    DetailItemComponent,
    BadgeComponent,
    ButtonComponent,
    LucideDynamicIcon,
  ],
  templateUrl: './workflow-details.component.html',
  styleUrls: ['./workflow-details.component.scss'],
})
export class WorkflowDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workflowsService = inject(WorkflowsService);
  private authService = inject(AuthService);
  private rolesService = inject(RolesService);
  private usersService = inject(UsersService);
  private swalService = inject(SwalService);
  private fb = inject(FormBuilder);

  workflowId: string | null = null;
  workflow: any = null;
  entity: any = null;
  tasks: ExtendedTask[] = [];
  
  loading = signal(false);
  submitting = signal(false);

  // Mappings for names
  usersMap: Record<string, string> = {};
  rolesMap: Record<string, string> = {};

  // Form for remarks
  transitionForm!: FormGroup;

  // Macro progress stepper
  stageList: { key: string; label: string; status: 'completed' | 'current' | 'upcoming' | 'rejected' }[] = [];

  // Authorization checks
  canAction = false;
  possibleTransitions: string[] = [];
  currentUser: any = null;
  userRoleIds: string[] = [];

  // Button icons
  protected readonly arrowLeftIcon = LucideArrowLeft;

  ngOnInit(): void {
    this.workflowId = this.route.snapshot.paramMap.get('id');
    this.currentUser = this.authService.getUser();
    
    this.transitionForm = this.fb.group({
      remarks: ['', [Validators.maxLength(500)]]
    });

    if (this.workflowId) {
      this.loadWorkflowDetails();
    } else {
      this.swalService.error('Invalid Workflow ID.');
      this.router.navigate(['/workflows/my-tasks']);
    }
  }

  loadWorkflowDetails(): void {
    this.loading.set(true);

    // 1. Fetch system roles/users first if possible (to build name maps)
    const rolesReq = this.rolesService.getRoles().pipe(catchError(() => of({ success: false, data: [] })));
    const usersReq = this.usersService.getUsers({ per_page: 100 }).pipe(catchError(() => of({ success: false, data: { data: [] } })));

    forkJoin([rolesReq, usersReq]).subscribe({
      next: ([rolesRes, usersRes]) => {
        // Build maps
        const rolesList = rolesRes.data || [];
        rolesList.forEach((r: any) => {
          this.rolesMap[r.id] = r.display_name;
        });

        // Set user's own role IDs
        const myRoleNames = this.currentUser?.roles || [];
        this.userRoleIds = rolesList
          .filter((r: any) => myRoleNames.includes(r.name))
          .map((r: any) => r.id);

        const usersList = usersRes.data?.data || [];
        usersList.forEach((u: any) => {
          this.usersMap[u.id] = u.name;
        });

        // Add current user to map
        if (this.currentUser) {
          this.usersMap[this.currentUser.id] = this.currentUser.name;
        }

        // 2. Load the actual Workflow Instance
        this.workflowsService.getWorkflowInstance(this.workflowId!).subscribe({
          next: (wfRes) => {
            this.workflow = wfRes.data;
            this.tasks = (this.workflow.tasks || []) as ExtendedTask[];

            // 3. Load the associated Entity
            this.loadEntityDetails();
          },
          error: () => {
            this.loading.set(false);
            this.swalService.error('Failed to load workflow instance.');
          }
        });
      }
    });
  }

  loadEntityDetails(): void {
    const entityId = this.workflow.entity_id;
    const entityType = this.workflow.entity_type;

    if (entityType === 'contract') {
      this.workflowsService.getContract(entityId).subscribe({
        next: (entityRes) => {
          this.entity = entityRes.data;
          
          // Supplement maps with info from contract
          if (this.entity.creator) {
            this.usersMap[this.entity.created_by] = this.entity.creator.name;
          }

          this.resolveNamesAndCheckAuth();
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.swalService.error('Failed to load contract details.');
        }
      });
    } else if (entityType === 'leave_request') {
      this.workflowsService.getLeaveRequest(entityId).subscribe({
        next: (entityRes) => {
          this.entity = entityRes.data;

          // Supplement maps with info from leave request
          if (this.entity.attorney) {
            // State attorney model email might link to a user.
            // Let's resolve attorney's name
            if (this.entity.attorney_id) {
              this.usersMap[this.entity.attorney_id] = this.entity.attorney.full_name;
            }
          }
          if (this.entity.approver) {
            this.usersMap[this.entity.approver_id] = this.entity.approver.name;
          }

          this.resolveNamesAndCheckAuth();
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.swalService.error('Failed to load leave request details.');
        }
      });
    } else {
      this.resolveNamesAndCheckAuth();
      this.loading.set(false);
    }
  }

  resolveNamesAndCheckAuth(): void {
    // 1. Resolve names on tasks
    this.tasks.forEach(t => {
      t.resolved_assignee_name = t.assigned_user_id ? (this.usersMap[t.assigned_user_id] || `User #${t.assigned_user_id.substring(0, 8)}`) : 'Unassigned';
      t.resolved_role_name = t.role_id ? (this.rolesMap[t.role_id] || `Role #${t.role_id.substring(0, 8)}`) : 'No Role';
    });

    // 2. Check transition authorization
    const activeTask = this.tasks.find(t => t.end_time === null);
    const isAdmin = this.currentUser?.roles?.includes('admin') || this.currentUser?.roles?.includes('super-admin');

    if (isAdmin) {
      this.canAction = true;
    } else if (activeTask) {
      const isAssignedToMe = activeTask.assigned_user_id && String(activeTask.assigned_user_id) === String(this.currentUser?.id);
      const isAssignedToMyRole = activeTask.role_id && this.userRoleIds.includes(activeTask.role_id);
      this.canAction = !!(isAssignedToMe || isAssignedToMyRole);
    } else {
      this.canAction = false;
    }

    // 3. Find possible next states
    const currentState = this.workflow.current_state;
    if (this.workflow.entity_type === 'contract') {
      this.possibleTransitions = CONTRACT_TRANSITIONS[currentState] || [];
    } else if (this.workflow.entity_type === 'leave_request') {
      this.possibleTransitions = LEAVE_TRANSITIONS[currentState] || [];
    } else {
      this.possibleTransitions = [];
    }

    // 4. Compute macro stage pipeline
    this.computeStageList();
  }

  onTransition(nextState: string): void {
    if (this.transitionForm.invalid) {
      return;
    }

    const remarks = this.transitionForm.value.remarks;

    this.swalService.confirm(
      `Are you sure you want to transition this workflow to "${this.capitalize(nextState)}"?`,
      'Transition Workflow State',
      'Transition'
    ).then((res) => {
      if (res.isConfirmed) {
        this.submitting.set(true);
        const entityId = this.workflow.entity_id;
        const entityType = this.workflow.entity_type;

        let request$;
        if (entityType === 'contract') {
          request$ = this.workflowsService.transitionContract(entityId, nextState, remarks);
        } else if (entityType === 'leave_request') {
          request$ = this.workflowsService.transitionLeaveRequest(entityId, nextState, remarks);
        } else {
          // Fallback update directly to workflow instance
          request$ = this.workflowsService.updateWorkflowInstance(this.workflowId!, {
            current_state: nextState,
            comments: remarks
          } as any);
        }

        request$.subscribe({
          next: () => {
            this.submitting.set(false);
            this.transitionForm.reset();
            this.swalService.success('Workflow transitioned successfully.');
            this.loadWorkflowDetails();
          },
          error: (err) => {
            this.submitting.set(false);
            const msg = err?.error?.message || err?.message || 'Transition failed.';
            this.swalService.error(msg);
          }
        });
      }
    });
  }

  // --- UI Helpers ---
  goBackToTasks(): void {
    this.router.navigate(['/workflows/my-tasks']);
  }

  getTransitionVariant(state: string): 'primary' | 'red' | 'amber' | 'outline' {
    const s = state?.toLowerCase();
    if (['approved', 'active', 'completed'].includes(s)) {
      return 'primary';
    }
    if (['rejected', 'cancelled', 'terminated'].includes(s)) {
      return 'red';
    }
    return 'amber';
  }

  getTransitionIcon(state: string): LucideIcon {
    const s = state?.toLowerCase();
    if (['rejected', 'cancelled', 'terminated'].includes(s)) {
      return LucideXCircle;
    }
    if (['approved', 'active', 'completed'].includes(s)) {
      return LucideCheckCircle2;
    }
    return LucideSend;
  }

  capitalize(str: string): string {
    if (!str) return '';
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  formatDate(dateStr: string | null, fallback = 'N/A'): string {
    if (!dateStr) return fallback;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'submitted':
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
      case 'signed':
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
      case 'terminated':
        return 'bg-gray-150 text-gray-700 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getWorkflowBadgeVariant(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'signed':
      case 'active':
      case 'completed':
        return 'success';
      case 'rejected':
      case 'cancelled':
      case 'terminated':
        return 'danger';
      case 'submitted':
      case 'under_review':
        return 'primary';
      case 'draft':
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  get timelineStatus(): { label: string; variant: BadgeVariant; live: boolean } {
    if (!this.workflow) return { label: 'Live', variant: 'success', live: true };
    const current = (this.workflow.current_state || '').toLowerCase();
    if (['rejected', 'terminated', 'cancelled'].includes(current)) {
      return { label: 'Closed', variant: 'danger', live: false };
    }
    if (
      current === 'completed' ||
      (this.workflow.entity_type === 'contract' && current === 'active') ||
      (this.possibleTransitions.length === 0 && !this.tasks.some(t => !t.end_time))
    ) {
      return { label: 'Completed', variant: 'secondary', live: false };
    }
    return { label: 'Live', variant: 'success', live: true };
  }

  get timelineTooltip(): string {
    const count = this.tasks.length;
    const eventCount = `${count} ${count === 1 ? 'event' : 'events'}`;
    if (this.timelineStatus.live) {
      return `${eventCount} • Live workflow activity`;
    }
    return `${eventCount} • Workflow ${this.timelineStatus.label.toLowerCase()}`;
  }

  getTaskBadgeVariant(task: ExtendedTask): BadgeVariant {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('reject') || node.includes('cancel')) return 'danger';
    if (task.end_time) {
      if (node.includes('approve') || node.includes('sign') || node.includes('complete') || node.includes('active')) {
        return 'success';
      }
      return 'primary';
    }
    return 'warning';
  }

  getTaskBadgeClass(task: ExtendedTask): string {
    if (task.end_time) {
      return 'bg-slate-100 text-slate-800 ring-slate-200';
    } else {
      return 'bg-primary-100 text-primary-900 ring-primary-300 animate-pulse';
    }
  }

  getInitials(name?: string): string {
    if (!name || name === 'Unassigned') return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getDuration(startStr: string | null, endStr: string | null): string {
    if (!startStr || !endStr) return '';
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return '';

    const diffSeconds = Math.floor((end - start) / 1000);
    if (diffSeconds < 60) return '< 1 min';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateOnly(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getNodeSubtitle(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (!task.end_time) {
      if (node.includes('approve')) return 'Waiting for approval';
      if (node.includes('review')) return 'Waiting for assignment & review';
      return 'Action currently in progress';
    }
    if (node.includes('pending')) return 'Waiting for assignment';
    if (node.includes('approve')) return 'Request has been approved';
    if (node.includes('reject')) return 'Request has been rejected';
    if (node.includes('submit')) return 'Submitted for review';
    if (node.includes('sign')) return 'Document signed';
    if (node.includes('active')) return 'Workflow active';
    if (node.includes('complete')) return 'Workflow completed';
    return 'Stage completed';
  }

  getNodeIcon(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('pending')) return 'hourglass_empty';
    if (node.includes('approve')) return 'check_circle';
    if (node.includes('reject')) return 'cancel';
    if (node.includes('review')) return 'rate_review';
    if (node.includes('submit')) return 'send';
    if (!task.end_time) return 'pending_actions';
    return 'task_alt';
  }

  getNodeCircleClass(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('reject') || node.includes('cancel')) {
      return 'bg-rose-600 text-white shadow-2xs border-2 border-white ring-2 ring-rose-100';
    }
    if (task.end_time) {
      return 'bg-emerald-600 text-white shadow-2xs border-2 border-white ring-2 ring-emerald-100';
    }
    return 'bg-blue-600 text-white shadow-2xs border-2 border-white ring-4 ring-blue-100 animate-pulse';
  }

  getNodeCircleIcon(task: ExtendedTask): LucideIcon {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('reject') || node.includes('cancel')) return LucideX;
    if (task.end_time) return LucideCheck;
    return LucideClock;
  }

  getEventTitle(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (!task.end_time) {
      if (node.includes('approve')) return 'Pending Final Approval';
      if (node.includes('review')) return 'Under Review';
      if (node.includes('sign')) return 'Awaiting Signatures';
      return `${this.capitalize(task.node_name)} (In Progress)`;
    }
    if (node.includes('draft')) return 'Draft Initialized';
    if (node.includes('submit')) return 'Submitted for Review';
    if (node.includes('review')) return 'Review Completed';
    if (node.includes('approve')) return 'Contract Approved';
    if (node.includes('sign')) return 'Document Signed';
    if (node.includes('active')) return 'Activated';
    if (node.includes('reject')) return 'Submission Rejected';
    if (node.includes('complete')) return 'Workflow Completed';
    return `${this.capitalize(task.node_name)} Completed`;
  }

  getCardBgClass(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('reject')) return 'bg-rose-50/20';
    if (!task.end_time) return 'bg-blue-50/20';
    return 'bg-white';
  }

  getCardBorderClass(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('reject')) return 'border-rose-200 border-l-4 border-l-rose-500';
    if (!task.end_time) return 'border-blue-300 border-l-4 border-l-blue-600';
    if (node.includes('approve') || node.includes('complete') || node.includes('active')) {
      return 'border-slate-200 border-l-4 border-l-emerald-500';
    }
    return 'border-slate-200 border-l-4 border-l-slate-400';
  }

  getHeaderIconBoxClass(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('approve')) return 'bg-emerald-100 text-emerald-600';
    if (node.includes('reject')) return 'bg-rose-100 text-rose-600';
    if (node.includes('pending')) return 'bg-slate-100 text-slate-600';
    if (!task.end_time) return 'bg-blue-100 text-blue-600';
    return 'bg-slate-100 text-slate-600';
  }

  getBadgeClass(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (node.includes('approve')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (node.includes('reject')) return 'bg-rose-100 text-rose-700 border border-rose-200';
    if (node.includes('pending')) return 'bg-slate-100 text-slate-600 border border-slate-200/80';
    if (!task.end_time) return 'bg-blue-100 text-blue-700 border border-blue-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  getBadgeText(task: ExtendedTask): string {
    const node = (task.node_name || '').toLowerCase();
    if (task.end_time) {
      if (node.includes('reject')) return 'REJECTED';
      if (node.includes('approve')) return 'APPROVED';
      if (node.includes('submit')) return 'SUBMITTED';
      if (node.includes('sign')) return 'SIGNED';
      if (node.includes('complete')) return 'COMPLETED';
      return 'COMPLETED';
    }
    return 'IN PROGRESS';
  }

  computeStageList(): void {
    if (!this.workflow) {
      this.stageList = [];
      return;
    }

    const current = (this.workflow.current_state || '').toLowerCase();
    const entityType = this.workflow.entity_type;

    let baseStages: { key: string; label: string }[] = [];
    if (entityType === 'contract') {
      baseStages = [
        { key: 'draft', label: 'Draft' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'under_review', label: 'Under Review' },
        { key: 'approved', label: 'Approved' },
        { key: 'active', label: 'Active' },
      ];
    } else if (entityType === 'leave_request') {
      baseStages = [
        { key: 'pending', label: 'Requested' },
        { key: 'approved', label: 'Approved' },
      ];
    } else {
      baseStages = [
        { key: 'draft', label: 'Draft' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'completed', label: 'Completed' },
      ];
    }

    const stageOrder = baseStages.map(s => s.key);
    const isTerminalCompleted = current === 'completed' || current === 'active';
    const isTerminalRejected = current === 'rejected' || current === 'terminated' || current === 'cancelled';

    let currentIndex = stageOrder.indexOf(current);
    if (currentIndex === -1) {
      if (isTerminalCompleted) currentIndex = stageOrder.length;
      else currentIndex = 0;
    }

    this.stageList = baseStages.map((stage, idx) => {
      let status: 'completed' | 'current' | 'upcoming' | 'rejected' = 'upcoming';

      if (isTerminalRejected && idx === currentIndex) {
        status = 'rejected';
      } else if (isTerminalCompleted || idx < currentIndex) {
        status = 'completed';
      } else if (idx === currentIndex) {
        status = 'current';
      } else {
        status = 'upcoming';
      }

      return {
        key: stage.key,
        label: stage.label,
        status,
      };
    });
  }

  getStageCircleClass(stage: any): string {
    switch (stage.status) {
      case 'completed':
        return 'bg-emerald-500 text-white shadow-2xs';
      case 'current':
        return 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-2xs';
      case 'rejected':
        return 'bg-rose-500 text-white shadow-2xs';
      default:
        return 'bg-slate-100 text-slate-400 border border-slate-200';
    }
  }
}
