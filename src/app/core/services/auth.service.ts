import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'https://localhost:7280/api/v1/auth/login';

  constructor(private http: HttpClient) {}

  login(payload: any) {
    return this.http.post<any>(this.api, payload).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('agropet_token', res.data);
        }
      })
    );
  }

  get token(): string | null {
    return localStorage.getItem('agropet_token');
  }

  logout(): void {
    localStorage.removeItem('agropet_token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('agropet_token');
    return !!token;
  }

  isLoggedIn(): boolean {
    const token = this.token;

    if (!token) return false;

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
