import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-button',
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() variant: 'outline' | 'amber' | 'red' | 'primary' | 'success' = 'outline';
  @Input() disabled: boolean = false;
  @Input() icon?: any;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() btnClick = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const base = 'flex! items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-figtree transition-all duration-200 cursor-pointer disabled:cursor-not-allowed select-none';
    
    let variantStyles = '';
    switch (this.variant) {
      case 'amber':
        variantStyles = 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100';
        break;
      case 'red':
        variantStyles = 'bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100';
        break;
      case 'primary':
        variantStyles = 'bg-[#d99414] hover:bg-[#c0800f] text-white disabled:bg-slate-100 disabled:text-slate-400 border border-transparent';
        break;
      case 'success':
        variantStyles = 'bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100';
        break;
      case 'outline':
      default:
        variantStyles = 'border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100';
        break;
    }

    return `${base} ${variantStyles}`;
  }

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.btnClick.emit(event);
  }
}
