import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService} from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = ''; // Clear previous error
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // replaceUrl: true removes login from history so back button won't go to login
          this.router.navigate(['/home'], { replaceUrl: true });
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = 'Invalid email or password.';
          this.cdr.detectChanges(); // Force view update to show error
        }
      });
    }
  }
}