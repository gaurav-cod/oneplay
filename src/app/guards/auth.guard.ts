import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  canActivate(): Observable<boolean> {
    this.authService.sessionTokenExists.subscribe((u) => {
      if (!u) {
        this.router.navigateByUrl('/login');
      }
    });

    return this.authService.sessionTokenExists;
  }

}
