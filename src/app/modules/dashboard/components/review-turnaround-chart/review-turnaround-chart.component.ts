import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowRight } from '@lucide/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-review-turnaround-chart',
  standalone: true,
  imports: [CommonModule, LucideArrowRight],
  templateUrl: './review-turnaround-chart.component.html',
})
export class ReviewTurnaroundChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  ngAfterViewInit() {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Create a smooth gradient background for the area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(0, 99, 214, 0.18)');
    gradient.addColorStop(1, 'rgba(0, 99, 214, 0.01)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          {
            data: [3.8, 4.1, 3.5, 3.2, 3.6, 3.6],
            borderColor: '#0063D6',
            borderWidth: 2.5,
            fill: true,
            backgroundColor: gradient,
            tension: 0.35,
            pointBackgroundColor: '#0063D6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointRadius: 4.5,
            pointHoverRadius: 6.5,
          },
        ],
      },
      options: {
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
            min: 2,
            max: 5,
            grid: {
              color: '#f1f5f9',
            },
            border: {
              dash: [4, 4],
            },
            ticks: {
              stepSize: 1,
              color: '#94A3B8',
              font: {
                size: 10,
                family: 'Figtree',
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
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
