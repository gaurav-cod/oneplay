import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ROUTES } from "../sidebar/sidebar.component";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { UserModel } from "src/app/models/user.model";
import { FormControl } from "@angular/forms";
import { RestService } from "src/app/services/rest.service";
import { GameModel } from "src/app/models/game.model";
import AwesomeDebouncePromise from "awesome-debounce-promise";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  public query = new FormControl("");
  public results: GameModel[] = [];
  private user: UserModel;

  @Output() toggleFriends = new EventEmitter();

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  constructor(
    location: Location,
    private readonly authService: AuthService,
    private readonly restService: RestService
  ) {
    this.location = location;
    this.authService.user.subscribe((u) => (this.user = u));
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter((listTitle) => listTitle);
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
  }

  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === "#") {
      titlee = titlee.slice(1);
    }

    for (var item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return "Oneplay";
  }

  search(value: string) {
    return this.restService
      .search(value)
      .subscribe((games) => (this.results = games));
  }

  toggleFriendsList() {
    this.toggleFriends.emit();
  }

  logout() {
    this.restService.deleteSession(this.authService.sessionKey).subscribe();
    this.authService.logout();
  }
}
