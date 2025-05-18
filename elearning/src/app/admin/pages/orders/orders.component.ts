import { Component, OnInit } from '@angular/core';
import { CloudService } from '../../../services/cloud.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  displayedColumns: string[] = ['userDetails', 'orderDetails', 'actions'];

  constructor(private cloudSer: CloudService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.cloudSer.getOrders().subscribe({
      next: (res: any) => {
        this.orders = res.data;
        this.isLoading = false;
      },
      error: (e) => {
        console.error("Error in Fetching Admin Orders", e);
        this.isLoading = false;
      }
    });
  }

  getCourseCount(courses: any[]): string {
    return courses.length === 1 ? '1 course' : `${courses.length} courses`;
  }
}
