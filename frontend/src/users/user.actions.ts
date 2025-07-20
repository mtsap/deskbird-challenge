import { createAction, props } from '@ngrx/store';
import { User } from '../users/user.interface';

export const loadUsers = createAction('[User] Load Users');

export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ users: User[] }>(),
);

export const loadUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: string }>(),
);

export const selectUser = createAction(
  '[User] Select User',
  props<{ user: User }>(),
);

export const clearSelectedUser = createAction('[User] Clear Selected User');

export const updateUser = createAction(
  '[User] Update User',
  props<{
    userId: number;
    userData: { firstName: string; lastName: string; email: string };
  }>(),
);

export const updateUserSuccess = createAction(
  '[User] Update User Success',
  props<{ user: User }>(),
);

export const updateUserFailure = createAction(
  '[User] Update User Failure',
  props<{ error: string }>(),
);

export const clearError = createAction('[User] Clear Error');
