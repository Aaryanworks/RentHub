import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: { login: any };
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    authServiceSpy = { login: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should call authService.login on valid submit', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: 'password' });
    authServiceSpy.login.mockReturnValue(of({}));

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(navigateSpy).toHaveBeenCalledWith(['/home'], { replaceUrl: true });
  });

  it('should set errorMessage on login failure', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: 'password' });
    authServiceSpy.login.mockReturnValue(throwError(() => new Error('Login failed')));

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid email or password.');
  });
});
