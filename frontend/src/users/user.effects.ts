import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../users/user.service';
import { MessageService } from 'primeng/api';
import * as UserActions from './user.actions';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private messageService: MessageService,
  ) {}

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(() =>
        this.userService.getUsers().pipe(
          map((users) => UserActions.loadUsersSuccess({ users })),
          catchError((error) => {
            console.error('Error loading users:', error);
            return of(
              UserActions.loadUsersFailure({
                error: 'Failed to load users. Please try again.',
              }),
            );
          }),
        ),
      ),
    ),
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      switchMap(({ userId, userData }) =>
        this.userService.updateUser(userId, userData).pipe(
          map((user) => UserActions.updateUserSuccess({ user })),
          catchError((error) => {
            console.error('Error updating user:', error);
            return of(
              UserActions.updateUserFailure({
                error: 'Failed to update user. Please try again.',
              }),
            );
          }),
        ),
      ),
    ),
  );

  updateUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.updateUserSuccess),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User updated successfully',
          });
        }),
      ),
    { dispatch: false },
  );

  updateUserFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.updateUserFailure),
        tap(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update user. Please try again.',
          });
        }),
      ),
    { dispatch: false },
  );
}
