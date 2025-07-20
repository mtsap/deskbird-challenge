import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ToolbarModule],
  template: `
    <div class="dashboard-container">
      <p-toolbar class="dashboard-toolbar">
        <ng-template pTemplate="start">
          <h1 class="dashboard-title">Users</h1>
        </ng-template>
      </p-toolbar>

      <div class="dashboard-content">
        <p-card class="welcome-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-users card-icon"></i>
            </div>
          </ng-template>
          <div class="card-content">
            <h3>Welcome to Users Dashboard</h3>
            <p>
              Manage your users efficiently with our comprehensive dashboard.
            </p>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      .dashboard-container {
        min-height: 100vh;
        background-color: var(--surface-ground);
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .dashboard-toolbar {
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-top: none;
        width: 100%;
        max-width: 1200px;
      }

      .dashboard-title {
        margin: 0;
        width: 100%;
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--text-color);
        text-align: center;
        letter-spacing: -0.02em;
      }

      .dashboard-content {
        padding: 2rem;
        width: 100%;
        max-width: 1200px;
        display: flex;
        justify-content: center;
      }

      .welcome-card {
        max-width: 600px;
        width: 100%;
      }

      .card-header {
        background: linear-gradient(
          135deg,
          var(--primary-color),
          var(--primary-600)
        );
        padding: 2rem;
        text-align: center;
      }

      .card-icon {
        font-size: 3rem;
        color: white;
      }

      .card-content {
        text-align: center;
        padding: 1rem 0;
      }

      .card-content h3 {
        margin: 0 0 1rem 0;
        color: var(--text-color);
        font-weight: 600;
        font-size: 1.25rem;
      }

      .card-content p {
        margin: 0;
        color: var(--text-color-secondary);
        line-height: 1.6;
        font-weight: 400;
      }

      @media (max-width: 768px) {
        .dashboard-content {
          padding: 1rem;
        }

        .dashboard-title {
          font-size: 1.5rem;
        }

        .card-header {
          padding: 1.5rem;
        }

        .card-icon {
          font-size: 2.5rem;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  constructor() {}
}
