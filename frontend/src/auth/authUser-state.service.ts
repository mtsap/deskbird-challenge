import { Injectable, signal, computed, inject } from '@angular/core';
import { JwtService } from './jwt.service';

export interface AuthUser {
  id: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthUserStateService {
  private jwtService = inject(JwtService);

  // Private signals
  private _authUser = signal<AuthUser | null>(null);
  private _token = signal<string | null>(null);
  private _isAuthenticated = signal<boolean>(false);

  // Public readonly computed signals
  readonly user = this._authUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  // Computed properties
  readonly isAdmin = computed(() => this._authUser()?.role == 'admin' || false);

  constructor() {
    this.loadUserFromStorage();
  }

  /**
   * Set user data after login
   */
  setUser(token: string): void {
    const decodedToken = this.jwtService.decodeToken(token);

    if (decodedToken && !this.jwtService.isTokenExpired(token)) {
      const user: AuthUser = {
        id: decodedToken.sub,
        role: decodedToken.role,
      };

      this._authUser.set(user);
      this._token.set(token);
      this._isAuthenticated.set(true);

      // Persist to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }

  /**
   * Clear user data on logout
   */
  clearUser(): void {
    this._authUser.set(null);
    this._token.set(null);
    this._isAuthenticated.set(false);

    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  /**
   * Load user data from localStorage on app start
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData && !this.jwtService.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userData) as AuthUser;
        this._authUser.set(user);
        this._token.set(token);
        this._isAuthenticated.set(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        this.clearUser();
      }
    } else {
      this.clearUser();
    }
  }

  /**
   * Refresh user data from token
   */
  refreshUserData(): void {
    const token = this._token();
    if (token) {
      this.setUser(token);
    }
  }
}
