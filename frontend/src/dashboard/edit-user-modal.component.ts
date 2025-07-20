import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { User } from '../users/user.interface';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      header="Edit User"
      styleClass="edit-user-dialog"
      [style]="{ width: '500px' }"
      (onHide)="onCancel()"
    >
      <form [formGroup]="editUserForm" (ngSubmit)="onSave()" class="edit-form">
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
            (click)="onCancel()"
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
  `,
  styles: [
    `
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
export class EditUserModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() user: User | null = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<{
    firstName: string;
    lastName: string;
    email: string;
  }>();
  @Output() cancel = new EventEmitter<void>();

  editUserForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.editUserForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
      });
    }

    if (changes['visible'] && !this.visible) {
      this.editUserForm.reset();
    }
  }

  onSave() {
    if (this.editUserForm.valid) {
      this.save.emit(this.editUserForm.value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
