import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LucideCalendarDays, LucideDownload, LucideChevronDown } from '@lucide/angular';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    LucideCalendarDays,
    LucideDownload,
    LucideChevronDown
  ],
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
  selectedPeriod: string = 'This Month';
  periods: string[] = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];

  selectPeriod(period: string) {
    this.selectedPeriod = period;
  }

  exportReport() {
    // Implement report export logic or trigger event
    console.log('Export Report clicked');
  }
}
