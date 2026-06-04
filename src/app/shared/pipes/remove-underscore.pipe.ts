import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeUnderscore',
  standalone: true,
})
export class RemoveUnderscorePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    return String(value).replace(/_/g, ' ');
  }
}
