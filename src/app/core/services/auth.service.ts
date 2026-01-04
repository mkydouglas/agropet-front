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
}
