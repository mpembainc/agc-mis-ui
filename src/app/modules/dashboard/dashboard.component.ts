import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { ContractsLifecycleChartComponent } from './components/contracts-lifecycle-chart/contracts-lifecycle-chart.component';
import { ContractsTypeChartComponent } from './components/contracts-type-chart/contracts-type-chart.component';
import { ContractsDepartmentChartComponent } from './components/contracts-department-chart/contracts-department-chart.component';
import { ContractsExpiryAlertComponent } from './components/contracts-expiry-alert/contracts-expiry-alert.component';
import { ContractValueSummaryComponent } from './components/contract-value-summary/contract-value-summary.component';
import { ObligationsMilestonesChartComponent } from './components/obligations-milestones-chart/obligations-milestones-chart.component';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities.component';
import { ReviewTurnaroundChartComponent } from './components/review-turnaround-chart/review-turnaround-chart.component';
import { DocumentsCategoryChartComponent } from './components/documents-category-chart/documents-category-chart.component';
import {
  LucideFileText,
  LucideFileInput,
  LucideFileSearch,
  LucideCheckCircle2,
  LucideBriefcase,
  LucideCalendarDays
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    DashboardCardComponent,
    ContractsLifecycleChartComponent,
    ContractsTypeChartComponent,
    ContractsDepartmentChartComponent,
    ContractsExpiryAlertComponent,
    ContractValueSummaryComponent,
    ObligationsMilestonesChartComponent,
    RecentActivitiesComponent,
    ReviewTurnaroundChartComponent,
    DocumentsCategoryChartComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  cards = [
    {
      label: 'Total Contracts',
      count: 156,
      icon: LucideFileText,
      theme: 'blue' as const,
      linkText: 'View all'
    },
    {
      label: 'New Intakes',
      count: 24,
      icon: LucideFileInput,
      theme: 'green' as const,
      linkText: 'View all'
    },
    {
      label: 'Under Review',
      count: 38,
      icon: LucideFileSearch,
      theme: 'purple' as const,
      linkText: 'View all'
    },
    {
      label: 'Pending Approval',
      count: 27,
      icon: LucideCheckCircle2,
      theme: 'orange' as const,
      linkText: 'View all'
    },
    {
      label: 'Active Contracts',
      count: 64,
      icon: LucideBriefcase,
      theme: 'teal' as const,
      linkText: 'View all'
    },
    {
      label: 'Expiring Soon',
      count: 12,
      icon: LucideCalendarDays,
      theme: 'red' as const,
      linkText: 'View list'
    }
  ];
}
