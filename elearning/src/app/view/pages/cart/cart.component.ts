import { Component, OnInit } from '@angular/core';
import { CloudService } from '../../../services/cloud.service';
import { Course } from '../../../model/courses.model';
import { UtilityService } from '../../../services/utility.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartIdArr: string[] = [];
  cart: Course[] = [];
  totalPrice: number = 0;
  isLoading: boolean = true;

  displayedColumns: string[] = ['title', 'price', 'action'];

  constructor(
    private cloudSer: CloudService,
    private us: UtilityService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const cart = localStorage.getItem("cart");
    if (cart) {
      this.cartIdArr = JSON.parse(cart);
      this.fetchCart();
    } else {
      this.isLoading = false;
    }
  }

  fetchCart(): void {
    this.isLoading = true;
    this.cloudSer.getCartDetails(this.cartIdArr).subscribe({
      next: (res: any) => {
        this.cart = res.data;
        this.calculateTotalPrice();
        this.isLoading = false;
      },
      error: (e) => {
        console.error("Error in Fetching Data", e);
        this.isLoading = false;
      }
    });
  }

  deleteFromCart(id: string): void {
    const index = this.cartIdArr.indexOf(id);
    if (index > -1) {
      this.cartIdArr.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(this.cartIdArr));
      this.fetchCart();
      this.us.cartItem();
    }
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cart.reduce((sum, item) => sum + Number(item.price), 0);
  }
}
