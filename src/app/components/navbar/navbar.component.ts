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
import { GameService } from "src/app/services/game.service";
import { GameStatusRO } from "src/app/interface";
import { GLinkPipe } from "src/app/pipes/glink.pipe";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  providers: [GLinkPipe],
})
export class NavbarComponent implements OnInit {
  public focus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public listTitles: any[];
  public location: Location;
  public query = new FormControl("");
  public results: GameModel[] = [];
  public gameStatus: GameStatusRO | null = null;
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

  get gameLink() {
    if (this.gameStatus && this.gameStatus.is_running) {
      return [
        "view",
        this.gLink.transform({
          title: this.gameStatus.game_name,
          oneplayId: this.gameStatus.game_id,
        } as GameModel),
      ];
    }
    return [];
  }

  get isGameRunning() {
    return this.gameStatus && this.gameStatus.is_running;
  }

  get isUserLive() {
    return this.gameStatus && this.gameStatus.is_user_connected;
  }

  get gamePlayTooltip() {
    if (this.isGameRunning && !this.isUserLive) {
      return this.gameStatus.game_name + " is running";
    }
    if (this.isUserLive) {
      return "You are playing " + this.gameStatus.game_name;
    }
    return "No game is running!";
  }

  constructor(
    location: Location,
    private readonly authService: AuthService,
    private readonly restService: RestService,
    private readonly ngbModal: NgbModal,
    private readonly gameService: GameService,
    private readonly gLink: GLinkPipe
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
    this.gameService.gameStatus.subscribe((status) => {
      this.gameStatus = status;
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

  open(container) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
    });
  }
}
