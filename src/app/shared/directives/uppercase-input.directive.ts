import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Uppercase Input Directive
 * @author Hossein Khamis<hossein.khamis@ega.go.tz>
 * @since 02-Feb-2026
 * @description This directive transforms input text to uppercase in real-time as the user types.
 * It can be applied to any input field by adding the 'appUppercaseInput' attribute.
 * The directive listens for input events and updates the value of the input field to its uppercase equivalent.
 * It also ensures that the form control value is updated accordingly if the input is part of a reactive form.
 */

@Directive({
    selector: '[appUppercaseInput]',
    
})
export class UppercaseInputDirective {

    constructor(
        private el: ElementRef,
        @Optional() @Self() private ngControl: NgControl
    ) { }

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        const upperValue = value.toUpperCase();

        if (value !== upperValue) {
            input.value = upperValue;
            if (this.ngControl && this.ngControl.control) {
                this.ngControl.control.setValue(upperValue, { emitEvent: false });
            }
        }
    }

    @HostListener('blur')
    onBlur() {
        const value = this.el.nativeElement.value;
        const upperValue = value.toUpperCase();
        if (this.ngControl && this.ngControl.control && value !== upperValue) {
            this.ngControl.control.setValue(upperValue);
        }
    }
}
