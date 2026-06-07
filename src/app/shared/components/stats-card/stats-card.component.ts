import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './stats-card.component.html',
})
export class StatsCardComponent {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() icon!: string;
  @Input() iconClass: string = '';
  @Input() valueClass: string = '';
  @Input() cardClass: string = '';
}
