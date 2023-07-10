import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth-navbar',
  templateUrl: './auth-navbar.component.html',
  styleUrls: ['./auth-navbar.component.scss']
})
export class AuthNavbarComponent implements OnInit {
  public isCollapsed = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }

  logoGuard(e) {
    if (location.pathname === '/dashboard/start-gaming')
    e.preventDefault();
  }

  get domain() {
    return environment.domain;
  }

}
