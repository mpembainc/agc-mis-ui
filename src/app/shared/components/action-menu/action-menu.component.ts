import { inject } from '@angular/core';

import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
   ChangeDetectionStrategy,
   Component,
   EventEmitter,
   Input,
   Output,
   ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { NgxPermissionsService } from 'ngx-permissions';
import { ActionMenuItem, MenuPredicate, MenuValue } from './action-menu';

@Component({
   selector: 'app-action-menu',
   imports: [NgTemplateOutlet, MatMenuModule, MatIconModule, MatButtonModule, NgClass],
   templateUrl: './action-menu.component.html',
   styleUrls: ['./action-menu.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionMenuComponent<T = any> {
   private permissionsService = inject(NgxPermissionsService);

   @Input() triggerLabel?: string;
   @Input() triggerIcon: string = 'more_vert';
   @Input() disabled = false;
   @Input() buttonMode: 'icon' | 'button' = 'icon';

   @Input({ required: true }) items: ActionMenuItem<T>[] = [];
   @Input() context: any;

   /** emits item id + item object for parent handling */
   @Output() itemSelected = new EventEmitter<{ id: string; item: ActionMenuItem<T> }>();

   @ViewChild(MatMenuTrigger) trigger?: MatMenuTrigger;

   private evalPredicate(pred: MenuPredicate<T> | undefined, ctx: T): boolean {
      if (typeof pred === 'function') return !!pred(ctx);
      return !!pred;
   }

   private resolveValue<R>(val: MenuValue<T, R> | undefined, ctx: T): R | undefined {
    if (typeof val === 'function') return (val as (c: T) => R)(ctx);
    return val;
  }

   private toArray(value?: string | string[]): string[] {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
   }

   private hasAnyPermission(required?: string | string[]): boolean {
      const requiredList = this.toArray(required);
      if (!requiredList.length) return true;

      const current = this.permissionsService.getPermissions();
      return requiredList.some((permission) => !!current[permission]);
   }

   private hasBlockedPermission(blocked?: string | string[]): boolean {
      const blockedList = this.toArray(blocked);
      if (!blockedList.length) return false;

      const current = this.permissionsService.getPermissions();
      return blockedList.some((permission) => !!current[permission]);
   }

   canRender(item: ActionMenuItem<T>): boolean {
      if (this.isHidden(item)) return false;
      if (!this.hasAnyPermission(item.permissionsOnly)) return false;
      if (this.hasBlockedPermission(item.permissionsExcept)) return false;

      return true;
   }

   isHidden(item: ActionMenuItem<T>): boolean {
      return this.evalPredicate(item.hidden, this.context);
   }

   isDisabled(item: ActionMenuItem<T>): boolean {
      return this.evalPredicate(item.disabled, this.context);
   }

   labelOf(item: ActionMenuItem<T>): string {
      return this.resolveValue(item.label, this.context) ?? '';
   }

   iconOf(item: ActionMenuItem<T>): string {
      return this.resolveValue(item.icon, this.context) ?? '';
   }

   hintOf(item: ActionMenuItem<T>): string {
      return this.resolveValue(item.hint, this.context) ?? '';
   }

   visibleItems(items: ActionMenuItem<T>[]): ActionMenuItem<T>[] {
      return (items || [])
         .filter((item) => this.canRender(item))
         .map((item) => ({ ...item }));
   }

   onItemClick(item: ActionMenuItem<T>) {
      // close menu after click
      this.trigger?.closeMenu();
      
      // optional inline action
      if (item.action) item.action(this.context);
   }

   iconColorClass(color?: ActionMenuItem['color']) {
      switch (color) {
         case 'primary':
            return 'text-blue-600!';
         case 'accent':
            return 'text-violet-600!';
         case 'warn':
            return 'text-red-600!';
         case 'success':
            return 'text-emerald-600!';
         case 'info':
            return 'text-sky-600!';
         default:
            return 'text-slate-600!';
      }
   }
}