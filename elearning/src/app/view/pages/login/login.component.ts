import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CloudService } from '../../../services/cloud.service';
import { UtilityService } from '../../../services/utility.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private cloudSer: CloudService,
    private us: UtilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.cloudSer.login(this.form.value.email, this.form.value.password).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.us.setToken(res.user.token);
            
            // Redirect based on user role
            if (res.user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/courses']);
            }
          } else {
            console.log('Login failed:', res.message);
            // You could add error handling here, like displaying a message to the user
          }
        },
        error: (e) => {
          console.log('USER ERROR', e);
          // You could add error handling here, like displaying a message to the user
        },
      });
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
