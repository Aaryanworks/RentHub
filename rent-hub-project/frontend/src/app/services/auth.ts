import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000'; // Our Backend URL
  
  // 'BehaviorSubject' allows other components (like Navbar) to subscribe to login status changes instantly
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  // Helper to check if token exists in browser memory
  private hasToken(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  // REGISTER
  register(userData: any) {
    // We send data to json-server-auth endpoint
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  // LOGIN
  login(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // If login successful, backend sends 'accessToken'
        if (response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true); // Tell the app: "We are logged in!"
        }
      })
    );
  }

  // LOGOUT
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }
  
  // Get current user details
  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
}