import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideCalendarDays, LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-contracts-expiry-alert',
  standalone: true,
  imports: [CommonModule, LucideCalendarDays, LucideArrowRight],
  templateUrl: './contracts-expiry-alert.component.html',
})
export class ContractsExpiryAlertComponent {
  items = [
    { title: 'Supply of Medical Equipment', ref: 'REF: AGC/CON/2022/045', days: '15 days', note: 'to expire', severity: 'red' },
    { title: 'Consultancy Services Agreement', ref: 'REF: AGC/CON/2023/067', days: '30 days', note: 'to expire', severity: 'orange' },
    { title: 'Office Lease Agreement', ref: 'REF: AGC/CON/2021/032', days: '45 days', note: 'to expire', severity: 'yellow' },
    { title: 'ICT Service Agreement', ref: 'REF: AGC/CON/2023/089', days: '60 days', note: 'to expire', severity: 'green' },
  ];

  getSeverityClasses(severity: string) {
    const maps: Record<string, { iconContainer: string; daysText: string }> = {
      red: {
        iconContainer: 'bg-red-50 border border-red-100 text-red-500',
        daysText: 'text-red-500'
      },
      orange: {
        iconContainer: 'bg-orange-50 border border-orange-100 text-orange-500',
        daysText: 'text-orange-500'
      },
      yellow: {
        iconContainer: 'bg-amber-50 border border-amber-100 text-amber-500',
        daysText: 'text-amber-500'
      },
      green: {
        iconContainer: 'bg-green-50 border border-green-100 text-green-600',
        daysText: 'text-green-600'
      }
    };
    return maps[severity] || maps['green'];
  }
}
