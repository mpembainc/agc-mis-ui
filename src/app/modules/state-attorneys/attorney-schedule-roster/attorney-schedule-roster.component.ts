import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkSchedulesService } from '../services/work-schedules.service';
import { RosterAttorneyItem, RosterAttorneyDay } from '../models/state-attorney.model';
import { SwalService } from '@shared/services/swal.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { CardComponent } from '@shared/components/card';
import {
  LucideCalendar,
  LucideCalendarDays,
  LucideChevronLeft,
  LucideChevronRight,
  LucideSearch,
  LucideUsers,
  LucideEye,
  LucideLandmark,
  LucideClock,
  LucideBriefcase,
  LucideUserCheck,
  LucideRefreshCw,
  LucideLayoutDashboard,
} from '@lucide/angular';

@Component({
  selector: 'app-attorney-schedule-roster',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    LucideCalendar,
    LucideCalendarDays,
    LucideChevronLeft,
    LucideChevronRight,
    LucideSearch,
    LucideUsers,
    LucideEye,
    LucideLandmark,
    LucideClock,
    LucideBriefcase,
    LucideUserCheck,
    LucideRefreshCw,
    LucideLayoutDashboard,
  ],
  templateUrl: './attorney-schedule-roster.component.html',
  styleUrls: ['./attorney-schedule-roster.component.scss'],
})
export class AttorneyScheduleRosterComponent implements OnInit {
  private schedulesService = inject(WorkSchedulesService);
  private swalService = inject(SwalService);

  // Icons
  protected readonly calendarIcon = LucideCalendar;
  protected readonly calendarDaysIcon = LucideCalendarDays;
  protected readonly chevronLeftIcon = LucideChevronLeft;
  protected readonly chevronRightIcon = LucideChevronRight;
  protected readonly searchIcon = LucideSearch;
  protected readonly usersIcon = LucideUsers;
  protected readonly eyeIcon = LucideEye;
  protected readonly courtIcon = LucideLandmark;
  protected readonly clockIcon = LucideClock;
  protected readonly briefcaseIcon = LucideBriefcase;
  protected readonly userCheckIcon = LucideUserCheck;
  protected readonly refreshIcon = LucideRefreshCw;
  protected readonly dashboardIcon = LucideLayoutDashboard;

  // State
  roster = signal<RosterAttorneyItem[]>([]);
  filteredRoster = signal<RosterAttorneyItem[]>([]);
  loading = signal<boolean>(false);
  selectedWeekStart = signal<string>(this.schedulesService.getMondayDateString());
  weekStartDate = signal<string>('');
  weekEndDate = signal<string>('');
  searchQuery = signal<string>('');

  // Summary counts
  totalAttorneys = signal<number>(0);
  availableCount = signal<number>(0);
  courtCount = signal<number>(0);
  onLeaveCount = signal<number>(0);

  daysOfWeek: { key: string; name: string }[] = [
    { key: 'monday', name: 'Monday' },
    { key: 'tuesday', name: 'Tuesday' },
    { key: 'wednesday', name: 'Wednesday' },
    { key: 'thursday', name: 'Thursday' },
    { key: 'friday', name: 'Friday' },
  ];

  ngOnInit(): void {
    this.loadRoster();
  }

  loadRoster(): void {
    this.loading.set(true);
    this.schedulesService.getRosterAvailability(this.selectedWeekStart()).subscribe({
      next: (res) => {
        this.weekStartDate.set(res.data.week_start_date);
        this.weekEndDate.set(res.data.week_end_date);
        const data = res.data.roster || [];
        this.roster.set(data);
        this.applyFilter();
        this.computeSummary(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.swalService.error('Failed to load State Attorneys availability roster.');
      },
    });
  }

  navigateWeek(offset: number): void {
    const nextMonday = this.schedulesService.offsetWeek(this.selectedWeekStart(), offset);
    this.selectedWeekStart.set(nextMonday);
    this.loadRoster();
  }

  goToCurrentWeek(): void {
    const currentMonday = this.schedulesService.getMondayDateString();
    this.selectedWeekStart.set(currentMonday);
    this.loadRoster();
  }

  getWeekRangeLabel(): string {
    return this.schedulesService.formatWeekRangeLabel(this.selectedWeekStart());
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) {
      this.filteredRoster.set(this.roster());
      return;
    }
    const filtered = this.roster().filter(
      (a) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.grade?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
    );
    this.filteredRoster.set(filtered);
  }

  computeSummary(items: RosterAttorneyItem[]): void {
    this.totalAttorneys.set(items.length);

    let court = 0;
    let onLeave = 0;
    let available = 0;

    items.forEach((attorney) => {
      let hasCourt = false;
      let hasLeave = false;
      Object.values(attorney.days || {}).forEach((d: RosterAttorneyDay) => {
        if (d.status === 'in_court') hasCourt = true;
        if (d.status === 'on_leave') hasLeave = true;
      });
      if (hasCourt) court++;
      if (hasLeave) onLeave++;
      if (!hasLeave && !hasCourt) available++;
    });

    this.courtCount.set(court);
    this.onLeaveCount.set(onLeave);
    this.availableCount.set(available);
  }

  getDayDateFormatted(dayKey: string): string {
    const items = this.roster();
    if (items.length > 0 && items[0].days?.[dayKey]?.date) {
      const d = new Date(items[0].days[dayKey].date + 'T00:00:00');
      return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    }
    return '';
  }

  getDayStatusBadgeVariant(status?: string | null): BadgeVariant {
    switch (status?.toLowerCase()) {
      case 'in_court':
        return 'warning';
      case 'office':
        return 'primary';
      case 'meeting':
        return 'purple';
      case 'field_work':
        return 'neutral';
      case 'on_leave':
        return 'danger';
      case 'available':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getDayStatusLabel(status?: string | null): string {
    switch (status?.toLowerCase()) {
      case 'in_court':
        return 'In Court';
      case 'office':
        return 'Chambers / Vetting';
      case 'meeting':
        return 'Advisory / Meeting';
      case 'field_work':
        return 'Field Duty';
      case 'on_leave':
        return 'On Leave';
      case 'available':
        return 'Available';
      default:
        return 'Available';
    }
  }
}
