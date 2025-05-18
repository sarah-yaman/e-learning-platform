import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './_component/navbar/navbar.component';
import { FooterComponent } from './_component/footer/footer.component';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent {

}
