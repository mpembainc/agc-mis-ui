import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * NIDA Number Format Directive
 * Formats input as: YYYYMMDD-NNNNN-NNNNN-NN (e.g. 19901231-56780-00000-01)
 * Usage: <input matInput appNidaFormat formControlName="nidaNumber" />
 */
@Directive({
  selector: 'input[appNidaFormat]',
  host: {
    '(input)': 'onInput($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class NidaFormatDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  private format(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 20);
    if (digits.length <= 8) return digits;
    if (digits.length <= 13) return `${digits.slice(0, 8)}-${digits.slice(8)}`;
    if (digits.length <= 18) return `${digits.slice(0, 8)}-${digits.slice(8, 13)}-${digits.slice(13)}`;
    return `${digits.slice(0, 8)}-${digits.slice(8, 13)}-${digits.slice(13, 18)}-${digits.slice(18)}`;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursor = input.selectionStart ?? input.value.length;
    const digitsBeforeCursor = input.value.slice(0, cursor).replace(/\D/g, '').length;

    const formatted = this.format(input.value);
    input.value = formatted;

    // Restore cursor: count through formatted string until we've passed the same number of digits
    let digitCount = 0;
    let newCursor = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) digitCount++;
      if (digitCount === digitsBeforeCursor) {
        newCursor = i + 1;
        break;
      }
    }
    input.setSelectionRange(newCursor, newCursor);

    this.ngControl?.control?.setValue(formatted, { emitEvent: true });
  }

  onKeydown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, arrows, home, end
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) return;

    // Block non-numeric characters
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
