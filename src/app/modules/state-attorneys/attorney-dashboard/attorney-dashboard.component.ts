import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { StateAttorneysService } from '../services/state-attorneys.service';
import { StateAttorneyDashboardData } from '../models/state-attorney.model';
import { SwalService } from '@shared/services/swal.service';
import { StatsCardComponent } from '@shared/components/stats-card/stats-card.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { CardComponent } from '@shared/components/card';
import {
  LucideUsers,
  LucideUserPlus,
  LucideRefreshCw,
  LucideUserCheck,
  LucideBriefcase,
  LucideTrendingUp,
  LucideAward,
  LucideCalendar,
  LucideClock,
  LucideBarChart3,
  LucideFileText,
  LucideAlertTriangle,
  LucideCheckCircle2,
} from '@lucide/angular';

@Component({
  selector: 'app-attorney-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressBarModule,
    MatIconModule,
    StatsCardComponent,
    HeaderComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
  ],
  templateUrl: './attorney-dashboard.component.html',
  styleUrls: ['./attorney-dashboard.component.scss'],
})
export class AttorneyDashboardComponent implements OnInit {
  private stateAttorneysService = inject(StateAttorneysService);
  private swalService = inject(SwalService);

  // Icons
  protected readonly listIcon = LucideUsers;
  protected readonly addIcon = LucideUserPlus;
  protected readonly refreshIcon = LucideRefreshCw;
  protected readonly deploymentIcon = LucideUserCheck;
  protected readonly workloadIcon = LucideBriefcase;
  protected readonly trendIcon = LucideTrendingUp;
  protected readonly awardIcon = LucideAward;
  protected readonly calendarIcon = LucideCalendar;
  protected readonly activityIcon = LucideClock;
  protected readonly perfIcon = LucideBarChart3;
  protected readonly fileTextIcon = LucideFileText;
  protected readonly alertTriangleIcon = LucideAlertTriangle;
  protected readonly checkCircleIcon = LucideCheckCircle2;

  metrics = signal<StateAttorneyDashboardData | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.stateAttorneysService.getDashboardMetrics().subscribe({
      next: (res) => {
        this.metrics.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load State Attorney dashboard metrics.');
      },
    });
  }

  getDeploymentBadgeVariant(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'success';
      case 'on assignment':
        return 'primary';
      case 'on leave':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getDeploymentColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-emerald-500';
      case 'on assignment':
        return 'bg-blue-600';
      case 'on leave':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  }

  getPromotionBadgeVariant(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
      case 'eligible':
        return 'success';
      case 'for evaluation':
        return 'warning';
      case 'not yet eligible':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getPromotionBarColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'eligible':
        return 'bg-emerald-500';
      case 'for evaluation':
        return 'bg-amber-500';
      case 'not yet eligible':
        return 'bg-slate-400';
      default:
        return 'bg-slate-300';
    }
  }

  getLeaveBadgeVariant(leaveType: string): BadgeVariant {
    const lower = leaveType?.toLowerCase() || '';
    if (lower.includes('sick')) return 'danger';
    if (lower.includes('vacation') || lower.includes('annual')) return 'primary';
    if (lower.includes('special') || lower.includes('study')) return 'purple';
    return 'secondary';
  }

  getWorkloadBandConfig(range: string): { bar: string; badge: BadgeVariant } {
    switch (range) {
      case '0-5':
        return { bar: 'bg-emerald-500', badge: 'success' };
      case '6-10':
        return { bar: 'bg-blue-500', badge: 'primary' };
      case '11-15':
        return { bar: 'bg-amber-500', badge: 'warning' };
      case '16-20':
        return { bar: 'bg-orange-500', badge: 'warning' };
      case '21+':
        return { bar: 'bg-rose-500', badge: 'danger' };
      default:
        return { bar: 'bg-slate-400', badge: 'secondary' };
    }
  }

  getMaxMonthlyCount(items: { assigned: number; completed: number }[]): number {
    if (!items || !items.length) return 100;
    return Math.max(...items.flatMap((i) => [i.assigned, i.completed]), 10);
  }
}
