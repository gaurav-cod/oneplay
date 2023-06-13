import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
} from "@angular/router";
import { map, Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import UAParser from "ua-parser-js";
import { MediaQueries } from "../utils/media-queries";

@Injectable({
  providedIn: "root",
})
export class LoginGuard implements CanActivateChild {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivateChild(childRoute: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const uagent = new UAParser();

    if (
      uagent.getOS().name === "iOS" &&
      /safari/i.test(uagent.getBrowser().name) &&
      MediaQueries.isInBrowser
    ) {
      this.router.navigate(["/install"], { replaceUrl: true });
      return false;
    }

    this.authService.sessionTokenExists.subscribe((u) => {
      if (u) {
        const { redirectUrl } = childRoute.queryParams;
        if (redirectUrl?.startsWith("http")) {
          window.location.href = redirectUrl;
        } else {
          this.router.navigateByUrl(redirectUrl ?? "/");
        }
      }
    });

    return this.authService.sessionTokenExists.pipe(map((u) => !u));
  }
}
