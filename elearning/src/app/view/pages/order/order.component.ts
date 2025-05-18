import { Component } from '@angular/core';
import { CloudService } from '../../../services/cloud.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilityService } from '../../../services/utility.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent {
  numOfItem!: number;
  isSubmitting = false;

  form = new FormGroup({
    name: new FormControl("", [Validators.required]),
    phone: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    payment: new FormControl("", [Validators.required])
  });

  paymentOptions = [
    { value: 'pay_later', viewValue: 'Pay Later' },
    { value: 'credit_card', viewValue: 'Credit Card' },
    { value: 'debit_card', viewValue: 'Debit Card' },
    { value: 'paypal', viewValue: 'PayPal' },
    { value: 'bank_transfer', viewValue: 'Bank Transfer' }
  ];

  constructor(
    private cloudSer: CloudService,
    private us: UtilityService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.us.numOfItem.subscribe(res => {
      this.numOfItem = res;
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const { name, phone, email, payment } = this.form.value;

    this.cloudSer.newOrder(
      name || '',
      phone || '',
      email || '',
      payment || ''
    ).subscribe({
      next: (res: any) => {
        this.snackBar.open('Order Successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.us.emptyCart();
        this.us.cartItem();
        this.router.navigate(['/']);
      },
      error: (e) => {
        console.error("Error in saving Data", e);
        this.snackBar.open('Order Failed. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
