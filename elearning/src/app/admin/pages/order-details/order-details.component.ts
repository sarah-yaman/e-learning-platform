import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CloudService } from '../../../services/cloud.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  orderId!: string;
  orderDetails: any;
  orders: any[] = [];
  isLoading = true;
  isError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cloudService: CloudService
  ) {}

  ngOnInit(): void {
    this.getParams();
  }

  getParams() {
    this.route.paramMap.subscribe(res => {
      const id = res.get("id");
      if (id) {
        this.orderId = id;
        this.getSingleOrder();
      } else {
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  getSingleOrder() {
    this.isLoading = true;
    this.isError = false;

    this.cloudService.getSingleOrder(this.orderId).subscribe({
      next: (res: any) => {
        this.orderDetails = res.data;
        this.getOrderDetails();
      },
      error: (e) => {
        console.error("Error", e);
        this.isError = true;
        this.isLoading = false;
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  getOrderDetails() {
    this.cloudService.getCartDetails(this.orderDetails.courses).subscribe({
      next: (res: any) => {
        this.orders = res.data;
        this.isLoading = false;
      },
      error: (e: any) => {
        console.error("Error in getting Order Details", e);
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  backToOrders() {
    this.router.navigate(['/admin/orders']);
  }
}
