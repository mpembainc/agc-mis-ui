import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'detail-item, app-detail-item',
  imports: [CommonModule],
  templateUrl: './detail-item.component.html',
})
export class DetailItemComponent {
  @Input({ required: true }) label!: string;
  @Input() value?: any;
  @Input() bold: boolean = false;
  @Input() multiline: boolean = false;
  @Input() emptyText: string = 'N/A';
  @Input() fullWidth: boolean = false;
  @Input() labelClass: string = '';
  @Input() valueClass: string = '';

  @HostBinding('class') get hostClass(): string {
    const classes = ['block'];
    if (this.fullWidth) {
      classes.push('col-span-full', 'md:col-span-2');
    }
    return classes.join(' ');
  }

  get hasValue(): boolean {
    return this.value !== undefined && this.value !== null && this.value !== '';
  }

  get displayValue(): string {
    if (this.hasValue) {
      return String(this.value);
    }
    return this.emptyText;
  }

  get computedLabelClass(): string {
    const base = 'text-sm font-bold text-slate-800 capitalize block';
    return this.labelClass ? `${base} ${this.labelClass}` : base;
  }

  get computedValueClass(): string {
    const base = this.bold
      ? 'text-sm font-bold text-slate-900 tracking-tight'
      : 'text-sm text-slate-700';
    const layout = this.multiline ? 'whitespace-pre-line leading-relaxed' : 'block';
    return [base, layout, this.valueClass].filter(Boolean).join(' ');
  }
}
