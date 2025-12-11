import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common'; // Needed for *ngIf

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    //  LISTEN to the status. This code runs every time login status changes.
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        const user = this.authService.getUser();
        this.userName = user.name || 'User'; // Get name from local storage
      }
    });
  }

  navigateToHome() {
    // Force navigation even if already on home
    const currentUrl = this.router.url;
    if (currentUrl === '/home' || currentUrl === '/') {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/home']);
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  logout() {
    this.authService.logout();
    // This forces the router to navigate, clearing current params
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}