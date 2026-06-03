import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-contracts-type-chart',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './contracts-type-chart.component.html',
})
export class ContractsTypeChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  ngAfterViewInit() {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Service Agreement',
          'Supply Agreement',
          'MoU / MoA',
          'Lease Agreement',
          'Consultancy Agreement',
          'Others',
        ],
        datasets: [
          {
            data: [45, 32, 21, 18, 16, 24],
            backgroundColor: '#0063D6',
            borderRadius: 4,
            barThickness: 8,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          y: {
            type: 'category',
            position: 'left',
            grid: {
              display: false,
            },
            ticks: {
              color: '#475569',
              font: {
                size: 11,
                family: 'Figtree',
                weight: 'normal',
              },
            },
          },
          yRight: {
            type: 'category',
            position: 'right',
            labels: ['45 (29%)', '32 (21%)', '21 (13%)', '18 (12%)', '16 (10%)', '24 (15%)'],
            grid: {
              display: false,
            },
            ticks: {
              color: '#0f172a',
              font: {
                size: 11,
                family: 'Figtree',
                weight: 'bold',
              },
            },
          },
          x: {
            max: 50,
            grid: {
              color: '#f1f5f9',
            },
            border: {
              dash: [4, 4],
            },
            ticks: {
              stepSize: 10,
              color: '#94A3B8',
              font: {
                size: 10,
                family: 'Figtree',
              },
            },
          },
        },
      },
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
