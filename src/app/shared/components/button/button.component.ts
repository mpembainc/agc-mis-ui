import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideDynamicIcon, LucideLoader2 } from '@lucide/angular';

@Component({
  selector: 'app-button',
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  private router = inject(Router, { optional: true });

  @Input() variant: 'outline' | 'amber' | 'red' | 'primary' | 'success' | 'danger' = 'outline';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon?: any;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() routerLink?: string | any[];
  @Input() customClass: string = '';

  @Output() btnClick = new EventEmitter<MouseEvent>();

  protected readonly loaderIcon = LucideLoader2;

  get buttonClasses(): string {
    const base = 'flex! items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-figtree transition-all duration-200 cursor-pointer disabled:cursor-not-allowed select-none';
    
    let variantStyles = '';
    switch (this.variant) {
      case 'amber':
        variantStyles = 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold shadow-2xs active:bg-amber-100/80 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none';
        break;
      case 'red':
      case 'danger':
        variantStyles = 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold shadow-2xs active:bg-red-100/80 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none';
        break;
      case 'primary':
        variantStyles = 'bg-[#d99414] hover:bg-[#c0800f] text-white font-semibold shadow-2xs active:bg-[#a66e0a] disabled:bg-slate-100 disabled:text-slate-400 border border-transparent disabled:shadow-none';
        break;
      case 'success':
        variantStyles = 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold shadow-2xs active:bg-emerald-100/80 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none';
        break;
      case 'outline':
      default:
        variantStyles = 'bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 hover:text-slate-950 font-semibold shadow-2xs active:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none';
        break;
    }

    return `${base} ${variantStyles} ${this.customClass}`.trim();
  }

  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this.routerLink && this.router) {
      if (Array.isArray(this.routerLink)) {
        this.router.navigate(this.routerLink);
      } else {
        this.router.navigate([this.routerLink]);
      }
    }
    this.btnClick.emit(event);
  }
}
