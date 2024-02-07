import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth-navbar',
  templateUrl: './auth-navbar.component.html',
  styleUrls: ['./auth-navbar.component.scss']
})
export class AuthNavbarComponent implements OnInit {
  public isCollapsed = true;
  public seriousNotificationPresent: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
    setTimeout(()=> {

      this.seriousNotificationPresent = this.authService.seriousNotificationPresent;
    }, 500);
  }

  logoGuard(e) {
    if (location.pathname === '/dashboard/start-gaming')
    e.preventDefault();
  }

  get domain() {
    return environment.domain;
  }

}
