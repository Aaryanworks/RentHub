import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1), // Take 1 value and complete
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true; // Allow access
      } else {
        router.navigate(['/login']); // Kick to login
        return false;
      }
    })
  );
};