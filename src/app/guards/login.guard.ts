import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
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

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const isEdgeCase: boolean = state.url === '/start-gaming';
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
      if (u && !isEdgeCase) {
        const { redirectUrl } = childRoute.queryParams;
        if (redirectUrl?.startsWith("http")) {
          window.location.href = redirectUrl;
        } else {
          this.router.navigateByUrl(redirectUrl ?? "/");
        }
      } else if (isEdgeCase && !u) this.router.navigate(["/login"], {
        queryParams: { redirectUrl: state.url },
      })
    });

    return this.authService.sessionTokenExists.pipe(map(u => isEdgeCase ? u : !u));
  }
}
