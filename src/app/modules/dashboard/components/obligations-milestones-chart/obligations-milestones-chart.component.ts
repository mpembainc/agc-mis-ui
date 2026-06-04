import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-obligations-milestones-chart',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './obligations-milestones-chart.component.html',
})
export class ObligationsMilestonesChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  legendItems = [
    { label: 'Overdue', value: 14, percentage: 15, dotClass: 'bg-[#E53935]' },
    { label: 'Due Soon (≤ 30 days)', value: 21, percentage: 23, dotClass: 'bg-[#E28704]' },
    { label: 'Due Later (> 30 days)', value: 57, percentage: 62, dotClass: 'bg-[#0063D6]' },
  ];

  ngAfterViewInit() {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.legendItems.map(item => item.label),
        datasets: [
          {
            data: this.legendItems.map(item => item.value),
            backgroundColor: ['#E53935', '#E28704', '#0063D6'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: '75%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
