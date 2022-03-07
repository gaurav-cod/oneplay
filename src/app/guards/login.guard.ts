import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) { }
  canActivate(): Observable<boolean> {
    this.authService.sessionTokenExists.subscribe((u) => {
      if (u) {
        this.router.navigateByUrl('/');
      }
    });

    return this.authService.sessionTokenExists.pipe(map(u => !u));
  }

}
