import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
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

  // Authorization checks
  canAction = false;
  possibleTransitions: string[] = [];
  currentUser: any = null;
  userRoleIds: string[] = [];

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
          request$ = this.workflowsService.transitionContract(entityId, nextState);
        } else if (entityType === 'leave_request') {
          request$ = this.workflowsService.transitionLeaveRequest(entityId, nextState, remarks);
        } else {
          // Fallback update directly to workflow instance
          request$ = this.workflowsService.updateWorkflowInstance(this.workflowId!, { current_state: nextState });
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

  capitalize(str: string): string {
    if (!str) return '';
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Active';
    const date = new Date(dateStr);
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

  getTaskBadgeClass(task: ExtendedTask): string {
    if (task.end_time) {
      return 'bg-slate-100 text-slate-800 ring-slate-200';
    } else {
      return 'bg-primary-100 text-primary-900 ring-primary-300 animate-pulse';
    }
  }
}
