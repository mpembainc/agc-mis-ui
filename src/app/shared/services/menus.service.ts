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
            exact: true
          },
          {
            label: 'Add New Attorney',
            route: '/state-attorneys/create',
            exact: true
          },
          {
            label: 'Leave Requests',
            route: '/leave-requests',
            exact: true
          },
          {
            label: 'Departments',
            route: '/3',
            exact: true
          },
          {
            label: 'Workload Overview',
            route: '/4',
            exact: true
          }
        ]
      },
      {
        label: 'Contracts',
        icon: 'assignment',
        children: [
          {
            label: 'Contracts Dashboard',
            route: '/contracts/dashboard',
            exact: true
          },
          {
            label: 'Contracts Directory',
            route: '/contracts',
            exact: true
          },
          {
            label: 'Add New Contract',
            route: '/contracts/create',
            exact: true
          }
        ]
      },
      {
        label: 'Documents',
        icon: 'folder',
        children: [
          {
            label: 'All Documents',
            route: '/documents',
            exact: true
          },
          {
            label: 'My Folders',
            route: '/8',
            exact: true
          }
        ]
      },
      {
        label: 'Workflow & Tasks',
        icon: 'task_alt',
        children: [
          {
            label: 'My Tasks',
            route: '/workflows/my-tasks',
            exact: true
          },
          {
            label: 'Team Tasks',
            route: '/workflows/team-tasks',
            exact: true
          },
          {
            label: 'Manage Workflows',
            route: '/workflows/manage',
            exact: true
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
            exact: true
          },
          {
            label: 'Activity Log',
            route: '/12',
            exact: true
          }
        ]
      },
      {
        label: 'Audit Trail',
        icon: 'policy',
        route: '/administration/audit-logs',
        exact: true
      },
      {
        label: 'Notices & Alerts',
        icon: 'notifications',
        route: '/14',
        exact: true
      },
      {
        label: 'Administration',
        icon: 'admin_panel_settings',
        children: [
          {
            label: 'Manage Users',
            route: '/administration/users',
            exact: true
          },
          {
            label: 'User Roles',
            route: '/administration/roles',
            exact: true
          },
          {
            label: 'Lookup Settings',
            route: '/administration/lookups',
            exact: true
          },
          {
            label: 'Global Configuration',
            route: '/16',
            exact: true
          }
        ]
      },
      {
        label: 'System Settings',
        icon: 'settings',
        route: '/17',
        exact: true
      }
    ];

    return allMenus;
  }
}
