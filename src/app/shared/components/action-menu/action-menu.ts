import { TemplateRef } from '@angular/core';

export type ActionMenuColor =
   | 'primary'
   | 'accent'
   | 'warn'
   | 'neutral'
   | 'success'
   | 'info';

export type MenuPredicate<T = any> = boolean | ((ctx: T) => boolean);
export type MenuValue<T, R> = R | ((ctx: T) => R);

export interface ActionMenuItem<T = any> {
   label?: MenuValue<T, string>;
   icon?: MenuValue<T, string>;
   hint?: MenuValue<T, string>;

   disabled?: MenuPredicate<T>;
   hidden?: MenuPredicate<T>;

   dividerBefore?: boolean;
   dividerAfter?: boolean;

   color?: ActionMenuColor;

   action?: (ctx?: any) => void;

   template?: TemplateRef<any>;

   permissionsOnly?: string | string[];
   permissionsExcept?: string | string[];

   rolesOnly?: string | string[];
   rolesExcept?: string | string[];
}