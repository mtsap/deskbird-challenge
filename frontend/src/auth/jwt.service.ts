import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  decodeToken<T = any>(token: string): T | null {
    try {
      return jwtDecode<T>(token);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return true;

      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
