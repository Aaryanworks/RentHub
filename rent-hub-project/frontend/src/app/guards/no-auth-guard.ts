import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

// This guard prevents logged-in users from accessing login/signup pages
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        // User is already logged in, redirect to home
        router.navigate(['/home'], { replaceUrl: true });
        return false;
      } else {
        // User is not logged in, allow access to login/signup
        return true;
      }
    })
  );
};
