import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-documents-category-chart',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './documents-category-chart.component.html',
})
export class DocumentsCategoryChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  legendItems = [
    { label: 'Contract Documents', value: 152, percentage: 49, dotClass: 'bg-[#0063D6]' },
    { label: 'Supporting Documents', value: 98, percentage: 31, dotClass: 'bg-[#1E8E42]' },
    { label: 'Correspondence', value: 42, percentage: 14, dotClass: 'bg-[#E28704]' },
    { label: 'Amendments', value: 20, percentage: 6, dotClass: 'bg-[#6339A6]' },
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
            backgroundColor: ['#0063D6', '#1E8E42', '#E28704', '#6339A6'],
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
