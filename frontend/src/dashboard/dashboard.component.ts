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
    // ... keep the same styles as the original component
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
