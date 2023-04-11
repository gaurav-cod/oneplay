import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { BehaviorSubject } from "rxjs";
import { GameStatusRO } from "src/app/interface";
import { GameModel } from "src/app/models/game.model";
import { UserModel } from "src/app/models/user.model";
import { AvatarPipe } from "src/app/pipes/avatar.pipe";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { AuthService } from "src/app/services/auth.service";
import { GameService } from "src/app/services/game.service";
import { MessagingService } from "src/app/services/messaging.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

declare interface RouteInfo {
  path: string;
  title: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: "/home", title: "Home", class: "" },
  { path: "/store", title: "Store", class: "" },
  { path: "/streams", title: "Streams", class: "" },
  // { path: '/library', title: 'Library', class: '' },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  providers: [GLinkPipe, AvatarPipe],
})
export class SidebarComponent implements OnInit {
  @Output() toggleFriends = new EventEmitter();

  public focus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public menuItems: any[];
  public isCollapsed = true;
  public query = new FormControl("");
  public results: GameModel[] = [];
  public gameStatus: GameStatusRO | null = null;
  public user: UserModel;

  private keyword = "";
  private keywordHash = "";

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get isFocused() {
    return this.focus.asObservable();
  }

  get domain() {
    return environment.domain;
  }

  get link() {
    return this.domain + "/dashboard/register?ref=" + this.user.id;
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

  get keywordQuery() {
    if (!!this.keyword && !!this.keywordHash) {
      return {
        keyword: this.keyword,
        hash: this.keywordHash,
      };
    }
    return {};
  }

  get isPrivate() {
    return this.user?.searchPrivacy;
  }

  get photo() {
    return this.user?.photo;
  }

  onUserError(event) {
    event.target.src = this.gavatar.transform(this.title);
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private restService: RestService,
    private readonly ngbModal: NgbModal,
    private readonly gameService: GameService,
    private readonly gLink: GLinkPipe,
    private readonly gavatar: AvatarPipe,
    private readonly messagingService: MessagingService
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
    this.gameService.gameStatus.subscribe((status) => {
      this.gameStatus = status;
    });
  }

  search(value: string) {
    return this.restService.search(value, 0, 5).subscribe((res) => {
      this.results = res.results;
      this.keyword = res.keyword;
      this.keywordHash = res.keywordHash;
    });
  }

  onFocus() {
    this.focus.next(true);
  }

  onBlur() {
    this.focus.next(false);
  }

  logout() {
    this.messagingService.removeToken().finally(() => {
      this.restService.deleteSession(this.authService.sessionKey).subscribe();
      this.authService.logout();
    });
  }

  deleteSessionData() {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete all your session data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        this.restService.deleteSessionData().subscribe({
          next: () => {
            Swal.fire({
              title: "Success",
              text: "Successfully deleted sessions",
              icon: "success",
              confirmButtonText: "OK",
            });
          },
          error: (err) => {
            Swal.fire({
              title: "Error Code: " + err.code,
              text: err.message,
              icon: "error",
              confirmButtonText: "Try Again",
            });
          },
        });
      }
    });
  }

  open(container) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }

  toggleFriendsList() {
    this.toggleFriends.emit();
  }

  TermsConditions(container: ElementRef<HTMLDivElement>) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
      scrollable: true,
    });
  }

  switchSearchPrivacy() {
    const privacy = !this.isPrivate;
    this.authService.updateProfile({ searchPrivacy: privacy });
    this.restService.setSearchPrivacy(privacy).subscribe({
      next: () => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Successfully turned ${privacy ? "on" : "off"} search privacy.`,
        });
      },
      error: (err) => {
        this.authService.updateProfile({ searchPrivacy: !privacy });
        Swal.fire({
          icon: "error",
          title: "Error Code: " + err.code,
          text: err.message,
        });
      },
    });
  }
}
