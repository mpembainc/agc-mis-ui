import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() tooltip?: string | null;
  @Input() text?: string | number | null;
  @Input() containerClass: string = '';

  get classList(): string {
    const base = 'inline-flex items-center px-2 pb-0.5 pt-1 rounded-full text-[10px] font-semibold font-figtree';

    const variantClass: Record<BadgeVariant, string> = {
      primary: 'bg-blue-100 text-blue-700',
      secondary: 'bg-slate-200 text-slate-700',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-sky-100 text-sky-700',
    };

    return [base, variantClass[this.variant] ?? variantClass.primary, this.containerClass]
      .filter(Boolean)
      .join(' ');
  }
}
