import { Component, OnInit } from '@angular/core';
import { CloudService } from '../../../services/cloud.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UtilityService } from '../../../services/utility.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  courses: string[] = [];
  isSubmitting = false;

  form!: FormGroup;
  
  constructor(
    private cloudSer: CloudService,
    private router: Router,
    private us: UtilityService
  ) { }

  ngOnInit(): void {
    // Get cart items from localStorage
    const cart = localStorage.getItem("cart");
    if (cart) {
      this.courses = JSON.parse(cart);
    }
    
    this.form = new FormGroup({ 
      name: new FormControl("", [Validators.required]),
      phone: new FormControl("", [Validators.required]),
      email: new FormControl("", [Validators.required, Validators.email]),
      payment: new FormControl("", [Validators.required])
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;
    
    this.isSubmitting = true;
    console.log("SUBMITTED", this.form.value);
    
    this.cloudSer.newOrder(
      this.form.value.name, 
      this.form.value.phone, 
      this.form.value.email, 
      this.form.value.payment
    ).subscribe({
      next: (res: any) => {
        console.log("Payment successful", res);
        // Clear cart after successful payment
        this.us.emptyCart();
        this.us.cartItem();
        // Redirect to home or confirmation page
        this.router.navigate(['/']);
      },
      complete: () => {
        console.log("Payment process completed");
        this.isSubmitting = false;
      },
      error: (e) => {
        console.error("Error in processing payment", e);
        this.isSubmitting = false;
      }
    });
  }
}
