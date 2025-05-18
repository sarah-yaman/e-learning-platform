import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './_component/sidebar/sidebar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { CloudService } from '../services/cloud.service';
import { UtilityService } from '../services/utility.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    CommonModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isMobileSidebarOpen = false;
  userName: string = '';

  constructor(
    private router: Router,
    private cloudService: CloudService,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    // Verify admin access on component initialization
    this.verifyAdminAccess();
  }

  verifyAdminAccess(): void {
    this.cloudService.isAuth().pipe(
      map((res: any) => {
        if (res.success && res.data) {
          if (res.data.role === 'admin') {
            this.userName = res.data.name || 'Admin';
            return true;
          } else {
            // Not an admin, redirect to home
            this.router.navigate(['/']);
            return false;
          }
        } else {
          // Not authenticated, redirect to login
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    ).subscribe();
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    // You can emit an event to sidebar or use a service to communicate this state
  }

  signOut() {
    this.cloudService.signout().subscribe({
      next: () => {
        this.utilityService.removeToken();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error signing out:', err);
        // Still remove token and redirect even if API call fails
        this.utilityService.removeToken();
        this.router.navigate(['/login']);
      }
    });
  }
}
