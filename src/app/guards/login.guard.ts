import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { map, Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class LoginGuard implements CanActivateChild {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const isEdgeCase: boolean = state.url === '/start-gaming';

    this.authService.sessionTokenExists.subscribe((u) => {
      if (u && !isEdgeCase) {
        let { redirectUrl } = childRoute.queryParams;
        if ((redirectUrl === "/" || redirectUrl === "/home" || !redirectUrl)
          && this.authService.trigger_speed_test
          && localStorage.getItem("#onboardingUser") === "true") {
            this.router.navigateByUrl("/speed-test");
        }
        else if (redirectUrl?.startsWith("http")) {
          window.location.href = redirectUrl;
        } else {
          this.router.navigateByUrl(redirectUrl ?? "/");
        }
      } else if (isEdgeCase && !u) {
        this.router.navigate(["/login"], {
        queryParams: { redirectUrl: state.url },
      })}
    });

    return this.authService.sessionTokenExists.pipe(map(u => isEdgeCase ? u : !u));
  }
}
