import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  LucideSend,
  LucideBadgeCheck,
  LucideXCircle,
  LucideClock,
  LucideTrendingUp,
  LucideTrendingDown,
  LucideFileDown,
} from '@lucide/angular';

type Period = 'today' | 'week' | 'month' | 'year';

interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  progress: number;
  progressLabel: string;
  iconName: 'send' | 'badge-check' | 'x-circle' | 'clock';
  accentColor: string;
  accentBg: string;
}

export interface RequestItem {
  ref: string;
  type: 'CAR INFORMATION' | 'PERSON INFORMATION';
  subject: string;
  institution: string;
  description?: string;
  status: 'approved' | 'rejected' | 'pending';
  requestedBy: string;
  requestedDate: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BaseChartDirective,
    LucideSend, LucideBadgeCheck, LucideXCircle, LucideClock,
    LucideTrendingUp, LucideTrendingDown, LucideFileDown,
  ],
})
export class DashboardComponent {
  readonly selectedPeriod = signal<Period>('month');

  readonly periods: { label: string; value: Period }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  private readonly statData: Record<Period, StatCard[]> = {
    today: [
      { label: 'Total Requests', value: '75', change: '+17.2%', changeType: 'up', progress: 83, progressLabel: 'Response rate', iconName: 'send', accentColor: '#6366f1', accentBg: 'rgba(99,102,241,0.1)' },
      { label: 'Approved', value: '42', change: '+11.3%', changeType: 'up', progress: 56, progressLabel: 'of total', iconName: 'badge-check', accentColor: '#10b981', accentBg: 'rgba(16,185,129,0.1)' },
      { label: 'Rejected', value: '14', change: '-3.4%', changeType: 'down', progress: 19, progressLabel: 'of total', iconName: 'x-circle', accentColor: '#ef4444', accentBg: 'rgba(239,68,68,0.1)' },
      { label: 'Pending', value: '19', change: '+2.1%', changeType: 'up', progress: 25, progressLabel: 'of total', iconName: 'clock', accentColor: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
    ],
    week: [
      { label: 'Total Requests', value: '513', change: '+9.3%', changeType: 'up', progress: 82, progressLabel: 'Response rate', iconName: 'send', accentColor: '#6366f1', accentBg: 'rgba(99,102,241,0.1)' },
      { label: 'Approved', value: '304', change: '+7.8%', changeType: 'up', progress: 59, progressLabel: 'of total', iconName: 'badge-check', accentColor: '#10b981', accentBg: 'rgba(16,185,129,0.1)' },
      { label: 'Rejected', value: '87', change: '-1.2%', changeType: 'down', progress: 17, progressLabel: 'of total', iconName: 'x-circle', accentColor: '#ef4444', accentBg: 'rgba(239,68,68,0.1)' },
      { label: 'Pending', value: '122', change: '+4.5%', changeType: 'up', progress: 24, progressLabel: 'of total', iconName: 'clock', accentColor: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
    ],
    month: [
      { label: 'Total Requests', value: '1,248', change: '+12.5%', changeType: 'up', progress: 83, progressLabel: 'Response rate', iconName: 'send', accentColor: '#6366f1', accentBg: 'rgba(99,102,241,0.1)' },
      { label: 'Approved', value: '842', change: '+8.3%', changeType: 'up', progress: 67, progressLabel: 'of total', iconName: 'badge-check', accentColor: '#10b981', accentBg: 'rgba(16,185,129,0.1)' },
      { label: 'Rejected', value: '189', change: '-2.1%', changeType: 'down', progress: 15, progressLabel: 'of total', iconName: 'x-circle', accentColor: '#ef4444', accentBg: 'rgba(239,68,68,0.1)' },
      { label: 'Pending', value: '217', change: '+3.2%', changeType: 'up', progress: 17, progressLabel: 'of total', iconName: 'clock', accentColor: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
    ],
    year: [
      { label: 'Total Requests', value: '14,892', change: '+23.4%', changeType: 'up', progress: 85, progressLabel: 'Response rate', iconName: 'send', accentColor: '#6366f1', accentBg: 'rgba(99,102,241,0.1)' },
      { label: 'Approved', value: '9,843', change: '+19.2%', changeType: 'up', progress: 66, progressLabel: 'of total', iconName: 'badge-check', accentColor: '#10b981', accentBg: 'rgba(16,185,129,0.1)' },
      { label: 'Rejected', value: '2,831', change: '-4.7%', changeType: 'down', progress: 19, progressLabel: 'of total', iconName: 'x-circle', accentColor: '#ef4444', accentBg: 'rgba(239,68,68,0.1)' },
      { label: 'Pending', value: '2,218', change: '+1.8%', changeType: 'up', progress: 15, progressLabel: 'of total', iconName: 'clock', accentColor: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
    ],
  };

  readonly stats = computed(() => this.statData[this.selectedPeriod()]);

  private readonly barDataByPeriod: Record<Period, ChartData<'bar'>> = {
    today: {
      labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      datasets: [
        { label: 'Requests', data: [8, 12, 15, 10, 9, 11, 7, 3], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false },
        { label: 'Responses', data: [5, 9, 13, 8, 8, 9, 6, 2], backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6, borderSkipped: false },
      ],
    },
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        { label: 'Requests', data: [82, 91, 88, 74, 79, 54, 45], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false },
        { label: 'Responses', data: [68, 78, 74, 62, 68, 42, 33], backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6, borderSkipped: false },
      ],
    },
    month: {
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      datasets: [
        { label: 'Requests', data: [1082, 1134, 956, 1201, 1178, 1248], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false },
        { label: 'Responses', data: [904, 978, 812, 1042, 1021, 1031], backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6, borderSkipped: false },
      ],
    },
    year: {
      labels: ["Apr'25", 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', "Jan'26", 'Feb', 'Mar'],
      datasets: [
        { label: 'Requests', data: [987, 1023, 1054, 1098, 1134, 1087, 1082, 1134, 956, 1201, 1178, 1248], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false },
        { label: 'Responses', data: [841, 876, 901, 943, 978, 934, 904, 978, 812, 1042, 1021, 1031], backgroundColor: 'rgba(16,185,129,0.85)', borderRadius: 6, borderSkipped: false },
      ],
    },
  };

  readonly barChartData = computed(() => this.barDataByPeriod[this.selectedPeriod()]);

  private readonly donutDataByPeriod: Record<Period, ChartData<'doughnut'>> = {
    today: { labels: ['Approved', 'Rejected', 'Pending'], datasets: [{ data: [42, 14, 19], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], hoverOffset: 8, borderWidth: 3, borderColor: '#fff' }] },
    week: { labels: ['Approved', 'Rejected', 'Pending'], datasets: [{ data: [304, 87, 122], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], hoverOffset: 8, borderWidth: 3, borderColor: '#fff' }] },
    month: { labels: ['Approved', 'Rejected', 'Pending'], datasets: [{ data: [842, 189, 217], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], hoverOffset: 8, borderWidth: 3, borderColor: '#fff' }] },
    year: { labels: ['Approved', 'Rejected', 'Pending'], datasets: [{ data: [9843, 2831, 2218], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], hoverOffset: 8, borderWidth: 3, borderColor: '#fff' }] },
  };

  readonly donutChartData = computed(() => this.donutDataByPeriod[this.selectedPeriod()]);

  readonly barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false, padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Figtree, sans-serif', size: 12 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { dash: [4, 4] }, ticks: { font: { family: 'Figtree, sans-serif', size: 12 } } },
    },
  };

  readonly donutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 14, font: { family: 'Figtree, sans-serif', size: 11 } } },
      tooltip: { padding: 10, cornerRadius: 8, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString()}` } },
    },
  };

  exportData(): void {
    // TODO: implement CSV/Excel export
  }

  getDonutColor(idx: number): string {
    const colors = this.donutChartData().datasets[0].backgroundColor;
    if (Array.isArray(colors)) return (colors[idx] as string) ?? '';
    return '';
  }
}
