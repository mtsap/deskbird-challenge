import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { LoginComponent } from '../login/login.component';
// import { AdminGuard } from './admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/dashboard.component').then(
        (c) => c.DashboardComponent,
      ),
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'admin',
  //   loadComponent: () =>
  //     import('./admin.component').then((c) => c.AdminComponent),
  //   canActivate: [AdminGuard],
  // },
  // {
  //   path: 'profile',
  //   loadComponent: () =>
  //     import('./profile.component').then((c) => c.ProfileComponent),
  //   canActivate: [AuthGuard],
  //   data: { roles: ['user', 'admin'] }, // Example role-based access
  // },
  // {
  //   path: 'settings',
  //   loadComponent: () =>
  //     import('./settings.component').then((c) => c.SettingsComponent),
  //   canActivate: [AuthGuard],
  //   data: { roles: ['admin'] }, // Admin only
  // },
  // {
  //   path: 'unauthorized',
  //   loadComponent: () =>
  //     import('./unauthorized.component').then((c) => c.UnauthorizedComponent),
  // },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
