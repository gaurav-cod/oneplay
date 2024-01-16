import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";
import { ViewComponent } from "../pages/view/view.component";
import { Observable, map } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class ViewGuard implements CanDeactivate<ViewComponent> {
  constructor(private readonly authService: AuthService) {}

  canDeactivate(component: ViewComponent): Observable<boolean> | boolean {
    if (component.startingGame) {
      return false;
    }
    if (this.authService.sessionToken) {
      return this.authService.wishlist.pipe(map((w) => !!w && w.length > 0)) ;
    } 
    return true;

  }
}
