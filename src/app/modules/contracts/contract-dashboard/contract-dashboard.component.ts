import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ContractsService } from '../services/contracts.service';
import { ContractDashboardData } from '../models/contract.model';
import { SwalService } from '@shared/services/swal.service';
import { StatsCardComponent } from '@shared/components/stats-card/stats-card.component';

@Component({
  selector: 'app-contract-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    StatsCardComponent,
  ],
  templateUrl: './contract-dashboard.component.html',
  styleUrls: ['./contract-dashboard.component.scss'],
})
export class ContractDashboardComponent implements OnInit {
  private contractsService = inject(ContractsService);
  private swalService = inject(SwalService);

  metrics = signal<ContractDashboardData | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.contractsService.getDashboardMetrics().subscribe({
      next: (res) => {
        this.metrics.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load contract dashboard metrics.');
      },
    });
  }

  // Format monetary value to currency abbreviation (e.g. Billion, Million)
  formatCurrency(val: number): string {
    if (val >= 1) {
      return `TSh ${val.toFixed(2)} Billion`;
    }
    return `TSh ${(val * 1000).toFixed(0)} Million`;
  }
}
