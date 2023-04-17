import { Injectable } from "@angular/core";
import { ActivatedRoute, CanActivate, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class LoginGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}
  canActivate(): Observable<boolean> {
    this.authService.sessionTokenExists.subscribe((u) => {
      if (u) {
        const { redirectUrl } = this.route.snapshot.queryParams;
        this.router.navigateByUrl(redirectUrl ?? "/");
      }
    });

    return this.authService.sessionTokenExists.pipe(map((u) => !u));
  }
}
