import { Component, OnInit } from '@angular/core';
import { CloudService } from '../../../services/cloud.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    CommonModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  constructor(private cloudSer: CloudService,
              private router: Router
  ) {}

  form!: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('student', [Validators.required])
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.cloudSer.signup(
        this.form.value.email,
        this.form.value.name,
        this.form.value.password,
        this.form.value.role
      ).subscribe({
        next: (res: any) => {
          if (res.success) {
            console.log('USER SIGNUP', res);
            // Store token if provided
            if (res.token) {
              localStorage.setItem('token', res.token);
            }
            this.router.navigate(['/courses']);
          } else {
            this.errorMessage = res.message || 'Signup failed';
          }
          this.loading = false;
        },
        error: (e) => {
          console.log('USER ERROR', e);
          this.errorMessage = e.error?.message || 'An error occurred during signup';
          this.loading = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
  
  // Helper method to get form control error messages
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control?.hasError('minlength')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least 6 characters`;
    }
    
    return '';
  }
}
