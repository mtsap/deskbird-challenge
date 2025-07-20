import { createReducer, on } from '@ngrx/store';
import { UserState, initialUserState } from './user.state';
import * as UserActions from './user.actions';

export const userReducer = createReducer(
  initialUserState,

  // Load Users
  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
    error: null,
  })),

  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    users: null,
    loading: false,
    error,
  })),

  // User Selection
  on(UserActions.selectUser, (state, { user }) => ({
    ...state,
    selectedUser: user,
  })),

  on(UserActions.clearSelectedUser, (state) => ({
    ...state,
    selectedUser: null,
  })),

  // Update User
  on(UserActions.updateUser, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),

  on(UserActions.updateUserSuccess, (state, { user }) => {
    const updatedUsers =
      state.users?.map((u) => (u.id === user.id ? user : u)) || null;

    return {
      ...state,
      users: updatedUsers,
      selectedUser: null,
      saving: false,
      error: null,
    };
  }),

  on(UserActions.updateUserFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  // Clear Error
  on(UserActions.clearError, (state) => ({
    ...state,
    error: null,
  })),
);
