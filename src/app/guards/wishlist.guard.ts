import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";
import { Observable, map } from "rxjs";
import { WishlistComponent } from "../pages/wishlist/wishlist.component";
import { AuthService } from "../services/auth.service";

@Injectable()
export class WishlistGuard implements CanDeactivate<WishlistComponent> {
  constructor(private readonly authService: AuthService) {}

  canDeactivate(): Observable<boolean> {
    return this.authService.triggerWishlist.pipe(map((r) => !r));
  }
}
