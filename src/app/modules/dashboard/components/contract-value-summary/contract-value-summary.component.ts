import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-contract-value-summary',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './contract-value-summary.component.html',
})
export class ContractValueSummaryComponent {
  totalValue = 'TZS 215.45B';
  breakdown = [
    { label: 'Active Contracts', value: 'TZS 168.32B', percentage: 78, dashClass: 'bg-[#0063D6]' },
    { label: 'Contracts Under Review', value: 'TZS 28.63B', percentage: 13, dashClass: 'bg-[#E28704]' },
    { label: 'Pending Approval', value: 'TZS 18.50B', percentage: 9, dashClass: 'bg-[#6339A6]' }
  ];
}
