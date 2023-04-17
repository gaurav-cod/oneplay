import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
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
        console.log(state.url);
        this.router.navigate(["/login"], {
          queryParams: { redirectUrl: state.url },
        });
      }
    });

    return this.authService.sessionTokenExists;
  }
}
