import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthUserStateService } from './authUser-state.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private authUserState = inject(AuthUserStateService);
  private router = inject(Router);

  canActivate(): boolean {
    const isAuthenticated = this.authUserState.isAuthenticated();
    const isAdmin = this.authUserState.isAdmin();

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!isAdmin) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
