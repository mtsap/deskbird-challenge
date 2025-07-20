import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { User } from '../users/user.interface';
import { AuthUserStateService } from '../auth/authUser-state.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EditUserModalComponent } from './edit-user-modal.component';
import { AppState } from '../app/app.state';
import * as UserActions from '../users/user.actions';
import * as UserSelectors from '../users/user.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ToolbarModule,
    ButtonModule,
    PanelModule,
    SkeletonModule,
    MessageModule,
    ToastModule,
    EditUserModalComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="dashboard-container">
      <p-toolbar class="dashboard-toolbar">
        <div class="p-toolbar-group-start">
          <h1 class="dashboard-title">Users</h1>
        </div>
        <div class="p-toolbar-group-end">
          <p-button
            icon="pi pi-sign-out"
            label="Logout"
            severity="secondary"
            size="small"
            (click)="logout()"
          >
          </p-button>
        </div>
      </p-toolbar>

      <div class="dashboard-content">
        <!-- Error Message -->
        <p-message
          *ngIf="(error$ | async) && !(loading$ | async)"
          severity="error"
          [text]="(error$ | async) || ''"
          styleClass="error-message"
          (onClose)="clearError()"
        >
        </p-message>

        <!-- Loading Skeleton -->
        <div *ngIf="loading$ | async" class="loading-container">
          <p-skeleton
            height="4rem"
            styleClass="mb-3"
            *ngFor="let item of [1, 2, 3, 4, 5]"
          ></p-skeleton>
        </div>

        <!-- Users List -->
        <div
          *ngIf="!(loading$ | async) && !(error$ | async)"
          class="users-container"
        >
          <div *ngFor="let user of users$ | async" class="user-item">
            <div class="user-info">
              <div class="user-avatar">
                <i class="pi pi-user"></i>
              </div>
              <div class="user-details">
                <h4 class="user-name">
                  {{ user.firstName }} {{ user.lastName }}
                </h4>
                <p class="user-email">{{ user.email }}</p>
                <small class="user-id">ID: {{ user.id }}</small>
              </div>
            </div>
            <div class="user-actions" *ngIf="isAdmin()">
              <p-button
                icon="pi pi-pencil"
                label="Edit"
                severity="secondary"
                size="small"
                (click)="editUser(user)"
              >
              </p-button>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="(users$ | async)?.length === 0" class="empty-state">
            <i class="pi pi-users empty-icon"></i>
            <h3>No users found</h3>
            <p>There are no users to display at the moment.</p>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <app-edit-user-modal
        [visible]="showEditModal"
        [user]="selectedUser$ | async"
        [saving]="(saving$ | async) || false"
        (save)="onSaveUser($event)"
        (cancel)="onCancelEdit()"
      ></app-edit-user-modal>

      <!-- Toast Messages -->
      <p-toast position="top-right"></p-toast>
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
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--text-color);
        text-align: center;
        letter-spacing: -0.02em;
        width: 100%;
      }

      .dashboard-content {
        padding: 2rem;
        width: 100%;
        max-width: 1200px;
      }

      .error-message {
        margin-bottom: 1rem;
        width: 100%;
      }

      .loading-container {
        width: 100%;
      }

      .users-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .user-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        background: var(--surface-card);
        border-radius: 12px;
        border: 1px solid var(--surface-border);
        transition: all 0.2s ease;
      }

      .user-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
      }

      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--primary-color),
          var(--primary-600)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .user-details {
        flex: 1;
      }

      .user-name {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
        line-height: 1.3;
      }

      .user-email {
        margin: 0 0 0.25rem 0;
        color: var(--text-color-secondary);
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .user-id {
        color: var(--text-color-secondary);
        font-size: 0.8rem;
        opacity: 0.7;
      }

      .user-actions {
        flex-shrink: 0;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-color-secondary);
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: var(--text-color-secondary);
        opacity: 0.5;
      }

      .empty-state h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .empty-state p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      /* Edit Modal Styles - Removed since they're now in the separate component */

      @media (max-width: 768px) {
        .dashboard-content {
          padding: 1rem;
        }

        .dashboard-title {
          font-size: 1.5rem;
        }

        .user-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
        }

        .user-info {
          width: 100%;
        }

        .user-actions {
          width: 100%;
          display: flex;
          justify-content: flex-end;
        }

        .empty-state {
          padding: 2rem 1rem;
        }

        .empty-icon {
          font-size: 3rem;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  // Observable properties from store
  users$: Observable<User[] | null>;
  selectedUser$: Observable<User | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  saving$: Observable<boolean>;

  showEditModal = false;

  constructor(
    private store: Store<AppState>,
    private authUserStateService: AuthUserStateService,
  ) {
    // Initialize observables from store
    this.users$ = this.store.select(UserSelectors.selectAllUsers);
    this.selectedUser$ = this.store.select(UserSelectors.selectSelectedUser);
    this.loading$ = this.store.select(UserSelectors.selectUsersLoading);
    this.error$ = this.store.select(UserSelectors.selectUsersError);
    this.saving$ = this.store.select(UserSelectors.selectUsersSaving);
  }

  ngOnInit() {
    this.loadUsers();

    // Subscribe to selected user changes to control modal visibility
    this.selectedUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.showEditModal = !!user;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.store.dispatch(UserActions.loadUsers());
  }

  isAdmin(): boolean {
    return this.authUserStateService.isAdmin();
  }

  editUser(user: User) {
    this.store.dispatch(UserActions.selectUser({ user }));
  }

  onCancelEdit() {
    this.store.dispatch(UserActions.clearSelectedUser());
  }

  onSaveUser(userData: { firstName: string; lastName: string; email: string }) {
    this.selectedUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedUser) => {
        if (selectedUser) {
          this.store.dispatch(
            UserActions.updateUser({
              userId: selectedUser.id,
              userData,
            }),
          );
        }
      });
  }

  clearError() {
    this.store.dispatch(UserActions.clearError());
  }

  logout() {
    this.authUserStateService.clearUser();
    this.router.navigate(['/login']);
  }
}
