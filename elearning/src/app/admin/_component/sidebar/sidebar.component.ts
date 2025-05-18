import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CloudService } from '../../../services/cloud.service';
import { UtilityService } from '../../../services/utility.service';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(
    private cloudService: CloudService,
    private us: UtilityService,
    private router: Router
  ) {}

  signoutSubmit() {
    this.us.removeToken();
    this.cloudService.signout().subscribe({
      next: (res: any) => console.log(res, 'Signout'),
      error: (e) => console.log('Error', e)
    });
    this.router.navigate(['/']);
  }
}
