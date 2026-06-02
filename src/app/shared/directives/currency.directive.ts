import { Directive, HostListener, ElementRef, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

/**
 * Currency Input Directive
 * @author Hossein Khamis<hossein.khamis@ega.go.tz>
 * @since 02-Feb-2026
 * This directive formats the input value as currency
 * Usage: <input type="text" appCurrencyInput formControlName="amount">
 */
@Directive({
    selector: '[appCurrencyInput]',
    
})
export class CurrencyDirective implements OnInit {

    constructor(private el: ElementRef<HTMLInputElement>, private control: NgControl) { }

    ngOnInit() {
        // Format initial value if exists
        setTimeout(() => {
            if (this.el.nativeElement.value) {
                this.format(this.el.nativeElement.value);
            }
        });
    }

    @HostListener('input', ['$event'])
    onInput(event: Event) {
        const input = event.target as HTMLInputElement;
        this.format(input.value);
    }

    @HostListener('blur')
    onBlur() {
        this.format(this.el.nativeElement.value, true);
    }

    @HostListener('focus')
    onFocus() {
        // Optional: Unformat on focus if desired, but typically users like to see the formatted value
        // this.unformat(); 
    }

    private format(value: string, isBlur: boolean = false) {
        if (!value) return;

        // 1. Remove non-numeric characters (except for the first decimal point)
        let cleanVal = value.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = cleanVal.split('.');
        if (parts.length > 2) {
            cleanVal = parts[0] + '.' + parts.slice(1).join('');
        }

        // 2. Update the model with the raw number
        // We want the model to be a number (or string representation of number without commas)
        if (cleanVal !== this.control.value) {
            this.control.control?.setValue(cleanVal, { emitEvent: false, emitModelToViewChange: false });
        }

        // 3. Format the view value with commas
        if (cleanVal) {
            const parts = cleanVal.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            // Limit decimal places to 2 (optional, but standard for currency)
            if (parts[1] && parts[1].length > 2) {
                parts[1] = parts[1].substring(0, 2);
            }

            this.el.nativeElement.value = parts.join('.');
        } else {
            this.el.nativeElement.value = '';
        }
    }
}