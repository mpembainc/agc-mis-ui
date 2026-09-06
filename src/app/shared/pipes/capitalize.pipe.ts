import { Pipe, PipeTransform } from '@angular/core';
import { toCapitalizedCase } from '@shared/utilities/utils';

@Pipe({
  name: 'capitalize',
  standalone: true,
})
export class CapitalizePipe implements PipeTransform {
  transform(value?: string | null): string {
    return toCapitalizedCase(value);
  }
}
