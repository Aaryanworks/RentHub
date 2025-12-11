import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Custom Validator: Must start with a letter (not a number)
function startsWithLetter(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && /^[0-9]/.test(value)) {
    return { startsWithNumber: true };
  }
  return null;
}

// Custom Validator: Name must contain only letters and spaces
function nameCharactersOnly(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && !/^[a-zA-Z\s]+$/.test(value)) {
    return { invalidCharacters: true };
  }
  return null;
}

// Custom Validator: Password must contain at least one special character
function hasSpecialCharacter(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    return { noSpecialCharacter: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {
    
    // Form Validation Rules
    this.signupForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3),
        startsWithLetter,      // Cannot start with a number
        nameCharactersOnly     // Only letters and spaces allowed
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        startsWithLetter,      // Cannot start with a number
        hasSpecialCharacter    // Must contain special character
      ]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.authService.register(this.signupForm.value).subscribe({
        next: () => {
          alert('Registration Successful! Please Login.');
          // replaceUrl: true removes signup from history
          this.router.navigate(['/login'], { replaceUrl: true });
        },
        error: (err) => {
          this.errorMessage = 'Registration failed. Email might already exist.';
        }
      });
    } else {
      this.signupForm.markAllAsTouched(); // Trigger error messages if user clicks submit empty
    }
  }
}