import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements OnInit {
  friendsCollapsed = true;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.wishlist = this.restService.getWishlist();
  }
}
