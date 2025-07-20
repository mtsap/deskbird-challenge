import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthUserStateService } from './authUser-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authUserState = inject(AuthUserStateService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const isAuthenticated = this.authUserState.isAuthenticated();

    if (!isAuthenticated) {
      localStorage.setItem('redirectUrl', state.url);
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
