import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthUserStateService } from './authUser-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authUserState = inject(AuthUserStateService);
  const token = authUserState.token();

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
