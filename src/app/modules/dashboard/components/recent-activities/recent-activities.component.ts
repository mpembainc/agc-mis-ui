import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideFilePlus,
  LucideFileSearch,
  LucideCheckCircle2,
  LucideEdit3,
  LucideArrowRight,
  LucideDynamicIcon
} from '@lucide/angular';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon, LucideArrowRight],
  templateUrl: './recent-activities.component.html',
})
export class RecentActivitiesComponent {
  activities = [
    {
      title: 'New contract intake submitted',
      subtitle: 'Supply of Laboratory Equipment - Ministry of Health',
      time: '2 hours ago',
      actor: 'By: A. Juma',
      icon: LucideFilePlus,
      theme: 'blue'
    },
    {
      title: 'Contract reviewed',
      subtitle: 'Consultancy Services Agreement - MoE',
      time: '5 hours ago',
      actor: 'By: M. Said',
      icon: LucideFileSearch,
      theme: 'orange'
    },
    {
      title: 'Contract approved',
      subtitle: 'ICT Services Agreement - ZICTA',
      time: '1 day ago',
      actor: 'By: DAG Office',
      icon: LucideCheckCircle2,
      theme: 'green'
    },
    {
      title: 'Amendment created',
      subtitle: 'Office Lease Agreement - AGC HQ',
      time: '2 days ago',
      actor: 'By: K. Ali',
      icon: LucideEdit3,
      theme: 'gray'
    }
  ];

  getThemeClasses(theme: string) {
    const maps: Record<string, string> = {
      blue: 'bg-blue-50 border border-blue-100 text-blue-500',
      orange: 'bg-orange-50 border border-orange-100 text-orange-500',
      green: 'bg-green-50 border border-green-100 text-green-500',
      gray: 'bg-slate-50 border border-slate-200 text-slate-500'
    };
    return maps[theme] || maps['gray'];
  }
}
