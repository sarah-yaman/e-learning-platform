import { Component, Input } from '@angular/core';
import { Course } from '../../../model/courses.model';
import { UtilityService } from "../../../services/utility.service";

// Angular Material & Common Imports
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,        // 👈 Required for *ngIf, *ngFor
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() course!: Course;

  constructor(private us: UtilityService) {}

  addToCart(id: string | undefined) {
    if (!id) {
      console.error("Course ID is undefined");
      return;
    }
    console.log("Course Id", id);
    let addedId = [];

    if (localStorage.getItem("cart")) {
      addedId = JSON.parse(localStorage.getItem("cart")!);
      if (addedId.indexOf(id) === -1) {
        addedId.push(id);
        localStorage.setItem("cart", JSON.stringify(addedId));
        alert("Added to Cart");
      } else {
        alert("Already Added To Cart, Please Check the cart!");
      }
    } else {
      addedId.push(id);
      localStorage.setItem("cart", JSON.stringify(addedId));
      alert("Added to Cart");
    }

    this.us.cartItem();
  }
}
