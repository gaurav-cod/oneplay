import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Params,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivateChild {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}
  canActivateChild(
    _: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.authService.sessionTokenExists.subscribe((u) => {
      if (!u) {
        const queryParams: Params = {};

        if (!this.authService.loggedOutByUser) {
          queryParams.redirectUrl = state.url;
        }

        this.router.navigate(["/login"], { queryParams }).then(() => {
          this.authService.loggedOutByUser = false;
        });
      }
    });

    return this.authService.sessionTokenExists;
  }
}
