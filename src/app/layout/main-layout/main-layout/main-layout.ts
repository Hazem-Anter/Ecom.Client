import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestNavbar } from '../../../shared/components/test-navbar/test-navbar';

// You will create these components later
// import { NavbarComponent } from '../navbar/navbar.component';
// import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, CommonModule, TestNavbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {

}
