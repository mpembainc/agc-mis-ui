import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogLayoutComponent } from '@shared/components/dialog-layout/dialog-layout.component';
import { AuditLog } from '../../models/audit-log.model';

interface FieldChange {
  field: string;
  oldVal: any;
  newVal: any;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
}

@Component({
  selector: 'app-audit-log-details-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    DialogLayoutComponent,
  ],
  templateUrl: './audit-log-details-dialog.component.html',
  styleUrls: ['./audit-log-details-dialog.component.scss'],
})
export class AuditLogDetailsDialogComponent {
  log: AuditLog;
  showAllFields = signal(false);

  constructor(
    public dialogRef: MatDialogRef<AuditLogDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { log: AuditLog }
  ) {
    this.log = data.log;
  }

  get changes(): FieldChange[] {
    const changesList: FieldChange[] = [];
    const oldObj = this.log.old_values || {};
    const newObj = this.log.new_values || {};

    const allKeys = Array.from(
      new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
    ).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');

    allKeys.forEach((key) => {
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      let status: 'added' | 'removed' | 'modified' | 'unchanged';
      
      const oldStr = this.formatValue(oldVal);
      const newStr = this.formatValue(newVal);

      if (oldStr === newStr) {
        status = 'unchanged';
      } else if (oldVal === undefined || oldVal === null) {
        status = 'added';
      } else if (newVal === undefined || newVal === null) {
        status = 'removed';
      } else {
        status = 'modified';
      }

      changesList.push({
        field: key,
        oldVal: oldVal !== undefined && oldVal !== null ? oldVal : null,
        newVal: newVal !== undefined && newVal !== null ? newVal : null,
        status,
      });
    });

    // Sort: modified first, then added, then removed, then unchanged
    return changesList.sort((a, b) => {
      const order = { modified: 1, added: 2, removed: 3, unchanged: 4 };
      return order[a.status] - order[b.status];
    });
  }

  get filteredChanges(): FieldChange[] {
    if (this.showAllFields()) {
      return this.changes;
    }
    return this.changes.filter(c => c.status !== 'unchanged');
  }

  formatValue(val: any): string {
    if (val === null || val === undefined) {
      return '-';
    }
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }
    return String(val);
  }

  getActionColor(action: string): string {
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
