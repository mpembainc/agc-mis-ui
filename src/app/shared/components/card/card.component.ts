import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { mergeClasses } from '@shared/utilities/utils';

export type CardRounded = 'none' | 'lg' | 'xl' | '2xl';
export type CardShadow = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card-header, card-header, [card-header]',
  imports: [CommonModule],
  template: `
    <div [class]="classList">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardHeaderComponent {
  @Input() customClass: string = '';

  get classList(): string {
    return mergeClasses(
      'px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between gap-3',
      this.customClass
    );
  }
}

@Component({
  selector: 'app-card-footer, card-footer, [card-footer]',
  imports: [CommonModule],
  template: `
    <div [class]="classList">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardFooterComponent {
  @Input() customClass: string = '';

  get classList(): string {
    return mergeClasses(
      'px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3',
      this.customClass
    );
  }
}

@Component({
  selector: 'app-card, card',
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './card.component.html',
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: any;
  @Input() iconClass: string = 'size-4.5 text-slate-500 shrink-0';
  @Input() titleClass: string = 'text-sm font-bold text-slate-900 uppercase tracking-wider';
  @Input() subtitleClass: string = 'text-xs text-slate-500 font-medium normal-case mt-0.5';
  @Input() customClass: string = '';
  @Input() bodyClass: string = '';
  @Input() headerClass: string = '';
  @Input() footerClass: string = '';
  @Input() noPadding: boolean = false;
  @Input() rounded: CardRounded = 'xl';
  @Input() shadow: CardShadow = 'xs';
  @Input() bordered: boolean = true;
  @Input() loading: boolean = false;
  @Input() showHeader?: boolean;

  get isHeaderVisible(): boolean {
    if (this.showHeader !== undefined) {
      return this.showHeader;
    }
    return Boolean(this.title || this.subtitle || this.icon);
  }

  get computedContainerClass(): string {
    const roundedMap: Record<CardRounded, string> = {
      none: 'rounded-none',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
    };

    const shadowMap: Record<CardShadow, string> = {
      none: 'shadow-none',
      '2xs': 'shadow-2xs',
      xs: 'shadow-xs',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    const base = [
      'relative bg-white text-slate-900 overflow-hidden',
      roundedMap[this.rounded] ?? roundedMap['xl'],
      shadowMap[this.shadow] ?? shadowMap['xs'],
      this.bordered ? 'border border-slate-200' : '',
    ];

    return mergeClasses(base.join(' '), this.customClass);
  }

  get computedBodyClass(): string {
    const padding = this.noPadding ? 'p-0' : 'p-6';
    return mergeClasses('relative', padding, this.bodyClass);
  }

  get computedHeaderClass(): string {
    const base = 'px-6 py-4 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between gap-3';
    return mergeClasses(base, this.headerClass);
  }
}

export const CARD_COMPONENTS = [CardComponent, CardHeaderComponent, CardFooterComponent] as const;
