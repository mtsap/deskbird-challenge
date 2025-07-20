import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { User } from '../users/user.interface';
import { UserService } from '../users/user.service';
import { AuthUserStateService } from '../auth/authUser-state.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ToolbarModule,
    ButtonModule,
    PanelModule,
    SkeletonModule,
    MessageModule,
    DialogModule,
    InputTextModule,
    ToastModule,
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
          *ngIf="error && !loading"
          severity="error"
          [text]="error"
          styleClass="error-message"
        >
        </p-message>

        <!-- Loading Skeleton -->
        <div *ngIf="loading" class="loading-container">
          <p-skeleton
            height="4rem"
            styleClass="mb-3"
            *ngFor="let item of [1, 2, 3, 4, 5]"
          ></p-skeleton>
        </div>

        <!-- Users List -->
        <div *ngIf="!loading && !error" class="users-container">
          <div *ngFor="let user of users" class="user-item">
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
          <div *ngIf="users.length === 0" class="empty-state">
            <i class="pi pi-users empty-icon"></i>
            <h3>No users found</h3>
            <p>There are no users to display at the moment.</p>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <p-dialog
        [(visible)]="showEditModal"
        [modal]="true"
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        header="Edit User"
        styleClass="edit-user-dialog"
        [style]="{ width: '500px' }"
      >
        <form
          [formGroup]="editUserForm"
          (ngSubmit)="saveUser()"
          class="edit-form"
        >
          <div class="form-grid">
            <div class="form-field">
              <label for="firstName" class="form-label">First Name *</label>
              <input
                pInputText
                id="firstName"
                formControlName="firstName"
                class="form-input"
                [class.ng-invalid]="
                  editUserForm.get('firstName')?.invalid &&
                  editUserForm.get('firstName')?.touched
                "
              />
              <small
                *ngIf="
                  editUserForm.get('firstName')?.invalid &&
                  editUserForm.get('firstName')?.touched
                "
                class="form-error"
              >
                First name is required
              </small>
            </div>

            <div class="form-field">
              <label for="lastName" class="form-label">Last Name *</label>
              <input
                pInputText
                id="lastName"
                formControlName="lastName"
                class="form-input"
                [class.ng-invalid]="
                  editUserForm.get('lastName')?.invalid &&
                  editUserForm.get('lastName')?.touched
                "
              />
              <small
                *ngIf="
                  editUserForm.get('lastName')?.invalid &&
                  editUserForm.get('lastName')?.touched
                "
                class="form-error"
              >
                Last name is required
              </small>
            </div>

            <div class="form-field full-width">
              <label for="email" class="form-label">Email *</label>
              <input
                pInputText
                id="email"
                formControlName="email"
                type="email"
                class="form-input"
                [class.ng-invalid]="
                  editUserForm.get('email')?.invalid &&
                  editUserForm.get('email')?.touched
                "
              />
              <small
                *ngIf="
                  editUserForm.get('email')?.invalid &&
                  editUserForm.get('email')?.touched
                "
                class="form-error"
              >
                <span *ngIf="editUserForm.get('email')?.errors?.['required']"
                  >Email is required</span
                >
                <span *ngIf="editUserForm.get('email')?.errors?.['email']"
                  >Please enter a valid email address</span
                >
              </small>
            </div>
          </div>

          <div class="form-actions">
            <p-button
              type="button"
              label="Cancel"
              severity="secondary"
              (click)="cancelEdit()"
              [disabled]="saving"
            >
            </p-button>
            <p-button
              type="submit"
              label="Save Changes"
              [loading]="saving"
              [disabled]="editUserForm.invalid"
            >
            </p-button>
          </div>
        </form>
      </p-dialog>

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

      /* Edit Modal Styles */
      ::ng-deep .edit-user-dialog .p-dialog-header {
        background: var(--surface-card);
        border-bottom: 1px solid var(--surface-border);
        padding: 1.5rem 1.5rem 1rem 1.5rem;
      }

      ::ng-deep .edit-user-dialog .p-dialog-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      ::ng-deep .edit-user-dialog .p-dialog-content {
        padding: 1.5rem;
        background: var(--surface-card);
      }

      .edit-form {
        width: 100%;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
        margin-bottom: 2rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-field.full-width {
        grid-column: 1 / -1;
      }

      .form-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--surface-border);
        border-radius: 6px;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        background: var(--surface-card);
        color: var(--text-color);
      }

      .form-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
      }

      .form-input.ng-invalid.ng-touched {
        border-color: var(--red-500);
      }

      .form-error {
        color: var(--red-500);
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--surface-border);
      }

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

        ::ng-deep .edit-user-dialog {
          width: 95vw !important;
          margin: 0 auto;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .form-actions {
          flex-direction: column-reverse;
        }

        .form-actions p-button {
          width: 100%;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  users: User[] = [];
  loading = true;
  error: string | null = null;
  showEditModal = false;
  saving = false;
  selectedUser: User | null = null;

  editUserForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private userService: UserService,
    private authUserStateService: AuthUserStateService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        console.error('Error loading users:', error);
      },
    });
  }

  isAdmin(): boolean {
    return this.authUserStateService.isAdmin();
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    this.showEditModal = true;
  }

  cancelEdit() {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editUserForm.reset();
  }

  saveUser() {
    if (this.editUserForm.invalid || !this.selectedUser) {
      return;
    }

    this.saving = true;
    const updatedUserData = this.editUserForm.value;

    this.userService
      .updateUser(this.selectedUser.id, updatedUserData)
      .subscribe({
        next: (user) => {
          // Update the user in the local array
          const index = this.users.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            this.users[index] = user;
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully',
          });

          this.showEditModal = false;
          this.selectedUser = null;
          this.editUserForm.reset();
          this.saving = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update user. Please try again.',
          });

          this.saving = false;
          console.error('Error updating user:', error);
        },
      });
  }

  logout() {
    this.authUserStateService.clearUser();
    this.router.navigate(['/login']);
  }
}
