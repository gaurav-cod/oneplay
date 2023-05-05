import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { Observable, map } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class QrLoginGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.authService.sessionTokenExists.subscribe((u) => {
      if (u) {
        const { redirectUrl } = route.queryParams;
        if (redirectUrl?.startsWith('http')) {
          window.location.href = redirectUrl;
        } else {
          this.router.navigateByUrl(redirectUrl ?? "/");
        }
      }
    });

    return this.authService.sessionTokenExists.pipe(map((u) => !u));
  }
}
