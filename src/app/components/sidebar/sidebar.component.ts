import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { BehaviorSubject } from "rxjs";
import { GameModel } from "src/app/models/game.model";
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
  { path: "/store", title: "Store", class: "" },
  { path: '/streams', title: 'Streams', class: '' },
  // { path: '/library', title: 'Library', class: '' },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  @Output() toggleFriends = new EventEmitter();
  
  public focus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public menuItems: any[];
  public isCollapsed = true;
  public query = new FormControl("");
  public results: GameModel[] = [];
  user: UserModel;
  
  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get isFocused() {
    return this.focus.asObservable();
  }

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
    const debouncedSearch = AwesomeDebouncePromise(
      (value) => this.search(value),
      500
    );
    this.query.valueChanges.subscribe((value) => {
      if (value.trim() !== "") {
        debouncedSearch(value);
      } else {
        this.results = [];
      }
    });
    this.focus.asObservable().subscribe((focused) => {
      if (!focused) {
        setTimeout(() => {
          this.query.setValue("");
        }, 300);
      }
    });
  }

  search(value: string) {
    return this.restService
      .search(value)
      .subscribe((games) => (this.results = games));
  }

  onFocus() {
    this.focus.next(true);
  }

  onBlur() {
    this.focus.next(false);
  }

  logout() {
    this.restService.deleteSession(this.authService.sessionKey).subscribe();
    this.authService.logout();
  }
}
