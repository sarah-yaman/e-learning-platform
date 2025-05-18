import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CloudService } from '../../../services/cloud.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  minDate: Date;

  constructor(
    private cloudSer: CloudService,
    private snackBar: MatSnackBar
  ) {
    // Set minimum date to today
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl("", [Validators.required, Validators.minLength(3)]),
      description: new FormControl("", [Validators.required, Validators.minLength(10)]),
      type: new FormControl("", [Validators.required]),
      date: new FormControl("", [Validators.required]),
      price: new FormControl("", [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)])
    });
  }

  form!: FormGroup;

  onSubmit() {
    if (this.form.invalid) {
      this.snackBar.open('Please fill all fields correctly!', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.cloudSer.addCourse({
      title: this.form.value.title,
      description: this.form.value.description,
      type: this.form.value.type,
      date: this.form.value.date,
      price: this.form.value.price
    }).subscribe({
      next: (res: any) => {
        this.snackBar.open('Course saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.form.reset();
      },
      error: (e: any) => {
        console.error("Error in saving Data", e);
        this.snackBar.open('Error saving course. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getErrorMessage(controlName: string) {
    const control = this.form.get(controlName);

    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid price (e.g. 99 or 99.99)';
    }
    return '';
  }
}
