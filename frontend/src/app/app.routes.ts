import { Routes } from '@angular/router';
import { LoginComponent } from '../login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: '/login' }, // Wildcard route for 404s
];
