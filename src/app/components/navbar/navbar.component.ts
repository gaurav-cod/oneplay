import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ROUTES } from "../sidebar/sidebar.component";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { UserModel } from "src/app/models/user.model";
import { FormControl } from "@angular/forms";
import { RestService } from "src/app/services/rest.service";
import { GameModel } from "src/app/models/game.model";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { BehaviorSubject } from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  public focus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public listTitles: any[];
  public location: Location;
  public query = new FormControl("");
  public results: GameModel[] = [];
  private user: UserModel;

  @Output() toggleFriends = new EventEmitter();

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get isFocused() {
    return this.focus.asObservable();
  }

  get link() {
    return "https://www.oneplay.in/dashboard/register?ref=" + this.user.id;
  }

  constructor(
    location: Location,
    private readonly authService: AuthService,
    private readonly restService: RestService,
    private readonly ngbModal: NgbModal
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
    this.focus.asObservable().subscribe((focused) => {
      if (!focused) {
        setTimeout(() => {
          this.query.setValue("");
        }, 300);
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

  onFocus() {
    this.focus.next(true);
  }

  onBlur() {
    this.focus.next(false);
  }

  open (container) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }
}
