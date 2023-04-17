import { Injectable } from "@angular/core";
import { ActivatedRoute, CanActivate, Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  canActivate(): Observable<boolean> {
    this.authService.sessionTokenExists.subscribe((u) => {
      if (!u) {
        const redirectUrl = this.router.url;
        this.router.navigate(["/login"], { queryParams: { redirectUrl } });
      }
    });

    return this.authService.sessionTokenExists;
  }
}
