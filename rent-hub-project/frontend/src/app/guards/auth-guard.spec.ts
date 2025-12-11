import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authServiceSpy: { isLoggedIn$: any };
  let routerSpy: { navigate: any };

  beforeEach(() => {
    authServiceSpy = { isLoggedIn$: of(true) };
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if logged in', () => new Promise<void>(done => {
    const result = executeGuard({} as any, {} as any);
    (result as any).subscribe((res: boolean) => {
      expect(res).toBe(true);
      done();
    });
  }));

  it('should redirect to login if not logged in', () => new Promise<void>(done => {
    TestBed.resetTestingModule();
    
    const authServiceSpyFalse = { isLoggedIn$: of(false) };
    const routerSpyObj = { navigate: vi.fn() };

    TestBed.configureTestingModule({
     providers: [
       { provide: AuthService, useValue: authServiceSpyFalse },
       { provide: Router, useValue: routerSpyObj }
     ]
   });

   const result = executeGuard({} as any, {} as any);
   (result as any).subscribe((res: boolean) => {
     expect(res).toBe(false);
     expect(routerSpyObj.navigate).toHaveBeenCalledWith(['/login']);
     done();
   });
 }));
});
