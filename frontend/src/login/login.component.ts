import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { AuthUserStateService } from '../auth/authUser-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
  ],
  template: `
    <div class="login-container">
      <p-card class="login-card">
        <!-- Title -->
        <ng-template pTemplate="header">
          <div class="login-header">
            <h1>Desk Users</h1>
          </div>
        </ng-template>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
          <!-- Error Message -->
          @if (errorMessage()) {
            <p-message
              severity="error"
              [text]="errorMessage()"
              styleClass="w-full mb-3"
            ></p-message>
          }

          <!-- Success Message -->
          @if (successMessage()) {
            <p-message
              severity="success"
              [text]="successMessage()"
              styleClass="w-full mb-3"
            ></p-message>
          }

          <!-- Username Field -->
          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              pInputText
              formControlName="username"
              placeholder="Enter your username"
              class="w-full"
              [class.ng-invalid]="
                loginForm.get('username')?.invalid &&
                loginForm.get('username')?.touched
              "
            />
            @if (
              loginForm.get('username')?.invalid &&
              loginForm.get('username')?.touched
            ) {
              <small class="p-error"
                >Username is required (min 3 characters)</small
              >
            }
          </div>

          <!-- Password Field -->
          <div class="field">
            <label for="password">Password</label>
            <p-password
              id="password"
              formControlName="password"
              placeholder="Enter your password"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
              [class.ng-invalid]="
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
            ></p-password>
            @if (
              loginForm.get('password')?.invalid &&
              loginForm.get('password')?.touched
            ) {
              <small class="p-error"
                >Password is required (min 6 characters)</small
              >
            }
          </div>

          <!-- Login Button -->
          <div class="field">
            <p-button
              type="submit"
              label="Login"
              icon="pi pi-sign-in"
              styleClass="w-full"
              [disabled]="loginForm.invalid || isLoading()"
              [loading]="isLoading()"
            ></p-button>
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f8f9fa;
        padding: 1rem;
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .login-header {
        text-align: center;
        padding: 1rem;
      }

      .login-header h1 {
        margin: 0;
        color: #495057;
        font-size: 2rem;
        font-weight: 600;
      }

      .login-form {
        padding: 1rem;
      }

      .field {
        margin-bottom: 1.5rem;
      }

      .field label {
        display: block;
        margin-bottom: 0.5rem;
        color: #495057;
        font-weight: 500;
      }

      .w-full {
        width: 100%;
      }

      :host ::ng-deep .p-inputtext,
      :host ::ng-deep .p-password input {
        width: 100%;
      }

      :host ::ng-deep .p-button {
        justify-content: center;
      }

      .p-error {
        color: #e24c4c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
      }

      .ng-invalid.ng-touched {
        border-color: #e24c4c;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private authUserState = inject(AuthUserStateService);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | undefined>(undefined);
  successMessage = signal<string | undefined>(undefined);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(undefined);
      this.successMessage.set(undefined);

      try {
        const { username, password } = this.loginForm.value;

        // Make HTTP call to authentication service
        const response = await firstValueFrom(
          this.authService.login({ username, password }),
        );

        console.log('Login successful:', response);
        this.successMessage.set('Login successful! Redirecting...');
        this.authUserState.setUser(response.access_token);

        // Redirect to dashboard or home page after successful login
        // setTimeout(() => {
        //   this.router.navigate(['/dashboard']);
        // }, 1500);
      } catch (error: any) {
        console.error('Login failed:', error);

        // Handle different error types
        if (error.status === 401) {
          this.errorMessage.set('Invalid username or password');
        } else if (error.status === 400) {
          this.errorMessage.set('Please check your credentials');
        } else if (error.status === 0) {
          this.errorMessage.set('Unable to connect to server');
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
