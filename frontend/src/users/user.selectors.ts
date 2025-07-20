import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState = createFeatureSelector<UserState>('users');

export const selectAllUsers = createSelector(
  selectUserState,
  (state: UserState) => state.users,
);

export const selectSelectedUser = createSelector(
  selectUserState,
  (state: UserState) => state.selectedUser,
);

export const selectUsersLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading,
);

export const selectUsersError = createSelector(
  selectUserState,
  (state: UserState) => state.error,
);

export const selectUsersSaving = createSelector(
  selectUserState,
  (state: UserState) => state.saving,
);
