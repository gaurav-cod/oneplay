import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

declare interface RouteInfo {
  path: string;
  title: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: "/home", title: "Home", class: "" },
  // { path: '/streams', title: 'Streams', class: '' },
  { path: "/store", title: "Store", class: "" },
  // { path: '/library', title: 'Library', class: '' },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  @Output() toggleFriends = new EventEmitter();

  public menuItems: any[];
  public isCollapsed = true;
  user: UserModel;

  constructor(
    private router: Router,
    private authService: AuthService,
    private restService: RestService
  ) {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
    this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  logout() {
    this.restService.deleteSession(this.authService.sessionKey).subscribe();
    this.authService.logout();
  }
}
