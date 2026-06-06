import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./modules/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/authenticated-layout/authenticated-layout').then(
        (m) => m.AuthenticatedLayout
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./modules/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'administration/users',
        loadComponent: () =>
          import('./modules/administration/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'administration/roles',
        loadComponent: () =>
          import('./modules/administration/roles/roles.component').then(
            (m) => m.RolesComponent
          ),
      },
      {
        path: 'administration/roles/:id/permissions',
        loadComponent: () =>
          import('./modules/administration/roles/role-permissions/role-permissions.component').then(
            (m) => m.RolePermissionsComponent
          ),
      },
      {
        path: 'state-attorneys',
        loadComponent: () =>
          import('./modules/state-attorneys/state-attorneys.component').then(
            (m) => m.StateAttorneysComponent
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./modules/state-attorneys/attorney-list/attorney-list.component').then(
                (m) => m.AttorneyListComponent
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./modules/state-attorneys/attorney-form/attorney-form.component').then(
                (m) => m.AttorneyFormComponent
              ),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./modules/state-attorneys/attorney-form/attorney-form.component').then(
                (m) => m.AttorneyFormComponent
              ),
          },
          {
            path: 'view/:id',
            loadComponent: () =>
              import('./modules/state-attorneys/attorney-view/attorney-view.component').then(
                (m) => m.AttorneyViewComponent
              ),
          },
        ],
      },
    ],
  },
];
