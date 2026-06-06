import { Injectable } from '@angular/core';
import { MenuItem } from '@shared/types/menu-item';

@Injectable({
  providedIn: 'root',
})
export class MenusService {
  getMenuItems(): MenuItem[] {
    const allMenus: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'home',
        route: '/dashboard',
        exact: true
      },
      {
        label: 'State Attorneys',
        icon: 'groups',
        children: [
          {
            label: 'Attorneys Directory',
            route: '/state-attorneys',
          },
          {
            label: 'Add New Attorney',
            route: '/state-attorneys/create',
          },
          {
            label: 'Departments',
            route: '/3', // Mock route pointing to dashboard
          },
          {
            label: 'Workload Overview',
            route: '/4', // Mock route pointing to dashboard
          }
        ]
      },
      {
        label: 'Contracts',
        icon: 'assignment',
        children: [
          {
            label: 'Contracts Directory',
            route: '/5',
          },
          {
            label: 'Add New Contract',
            route: '/6',
          }
        ]
      },
      {
        label: 'Documents',
        icon: 'folder',
        children: [
          {
            label: 'All Documents',
            route: '/7',
          },
          {
            label: 'My Folders',
            route: '/8',
          }
        ]
      },
      {
        label: 'Workflow & Tasks',
        icon: 'task_alt',
        children: [
          {
            label: 'My Tasks',
            route: '/9',
          },
          {
            label: 'Team Tasks',
            route: '/10',
          }
        ]
      },
      {
        label: 'Reports & Analytics',
        icon: 'bar_chart',
        children: [
          {
            label: 'Workload Reports',
            route: '/11',
          },
          {
            label: 'Activity Log',
            route: '/12',
          }
        ]
      },
      {
        label: 'Audit Trail',
        icon: 'policy',
        route: '/13'
      },
      {
        label: 'Notices & Alerts',
        icon: 'notifications',
        route: '/14'
      },
      {
        label: 'Administration',
        icon: 'admin_panel_settings',
        children: [
          {
            label: 'Manage Users',
            route: '/administration/users',
          },
          {
            label: 'User Roles',
            route: '/administration/roles',
          },
          {
            label: 'Lookup Settings',
            route: '/administration/lookups',
          },
          {
            label: 'Global Configuration',
            route: '/16',
          }
        ]
      },
      {
        label: 'System Settings',
        icon: 'settings',
        route: '/17'
      }
    ];

    return allMenus;
  }
}
