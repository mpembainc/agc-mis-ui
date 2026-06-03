import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-contracts-lifecycle-chart',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './contracts-lifecycle-chart.component.html',
})
export class ContractsLifecycleChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  legendItems = [
    { label: 'Intake', value: 24, percentage: 15, dotClass: 'bg-[#0063D6]' },
    { label: 'Review', value: 38, percentage: 24, dotClass: 'bg-[#E28704]' },
    { label: 'Approval', value: 27, percentage: 17, dotClass: 'bg-[#6339A6]' },
    { label: 'Active', value: 64, percentage: 41, dotClass: 'bg-[#1E8E42]' },
    { label: 'Archived', value: 3, percentage: 2, dotClass: 'bg-[#94A3B8]' },
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
            backgroundColor: ['#0063D6', '#E28704', '#6339A6', '#1E8E42', '#94A3B8'],
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
