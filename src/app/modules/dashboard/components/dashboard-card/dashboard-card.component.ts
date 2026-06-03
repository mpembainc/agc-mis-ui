import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

export type CardTheme = 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideDynamicIcon],
  templateUrl: './dashboard-card.component.html',
})
export class DashboardCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) count!: number;
  @Input({ required: true }) icon!: any;
  @Input() theme: CardTheme = 'blue';
  @Input() linkText: string = 'View all';
  @Input() linkRoute?: string;

  get themeClasses(): { circle: string; link: string } {
    const maps: Record<CardTheme, { circle: string; link: string }> = {
      blue: {
        circle: 'bg-[#0063D6] text-white',
        link: 'text-[#0063D6] hover:text-[#0051B0]'
      },
      green: {
        circle: 'bg-[#1E8E42] text-white',
        link: 'text-[#0063D6] hover:text-[#0051B0]'
      },
      purple: {
        circle: 'bg-[#6339A6] text-white',
        link: 'text-[#0063D6] hover:text-[#0051B0]'
      },
      orange: {
        circle: 'bg-[#E28704] text-white',
        link: 'text-[#0063D6] hover:text-[#0051B0]'
      },
      teal: {
        circle: 'bg-[#008080] text-white',
        link: 'text-[#0063D6] hover:text-[#0051B0]'
      },
      red: {
        circle: 'bg-[#E53935] text-white',
        link: 'text-[#0063D6] hover:text-[#0051B0]'
      }
    };
    return maps[this.theme] || maps.blue;
  }
}
