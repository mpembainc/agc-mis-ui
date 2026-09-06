import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'slate'
  | 'red'
  | 'emerald'
  | 'green'
  | 'amber'
  | 'yellow'
  | 'blue'
  | 'sky'
  | 'purple'
  | 'indigo'
  | 'neutral';

@Component({
  selector: 'app-badge, badge',
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'secondary';
  @Input() tooltip?: string | null;
  @Input() text?: string | number | null;
  @Input() pill: boolean = false;
  @Input() containerClass: string = '';

  get classList(): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium border';
    const shape = this.pill ? 'rounded-full' : 'rounded';

    const variantClass: Record<string, string> = {
      primary: 'bg-blue-50 text-blue-700 border-blue-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      secondary: 'bg-slate-100 text-slate-700 border-slate-200',
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
      neutral: 'bg-slate-100 text-slate-700 border-slate-200',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-50 text-amber-800 border-amber-200',
      amber: 'bg-amber-50 text-amber-800 border-amber-200',
      yellow: 'bg-amber-50 text-amber-800 border-amber-200',
      danger: 'bg-red-50 text-red-700 border-red-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      info: 'bg-sky-50 text-sky-700 border-sky-200',
      sky: 'bg-sky-50 text-sky-700 border-sky-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };

    return [base, shape, variantClass[this.variant] ?? variantClass['secondary'], this.containerClass]
      .filter(Boolean)
      .join(' ');
  }
}

