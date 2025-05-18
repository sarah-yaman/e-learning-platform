import { Component, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { UtilityService } from '../../../services/utility.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,  // Add this first
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatBadgeModule,
    MatFormFieldModule,  // Add this
    MatInputModule,      // Add this
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  numOfItem = 0;

  constructor(private us: UtilityService) {}

  ngOnInit(): void {
    this.us.numOfItem.subscribe(res => {
      this.numOfItem = res;
    });
  }
}
