import { Component, Input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-simple-table',
  templateUrl: './simple-table.component.html',
  imports: [UpperCasePipe],
})
export class SimpleTableComponent {
  /** All column headers in order. */
  @Input() columns: string[] = [];
  @Input() columnConfig: { [key: string]: any } = {};
  /** Each row is an ordered array of cell values matching the headers. */
  @Input() rows: any[][] = [];
}
