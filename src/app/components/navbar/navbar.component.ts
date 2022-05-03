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
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";
import { MessagingService } from "src/app/services/messaging.service";

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
  public uResults: UserModel[] = [];
  public gameStatus: GameStatusRO | null = null;

  private user: UserModel;
  private acceptedFriends: FriendModel[] = [];
  private pendingFriends: FriendModel[] = [];
  private dontClose = false;

  @Output() toggleFriends = new EventEmitter();

  @ViewChild("search") searchElement: ElementRef;

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
    private readonly friendsService: FriendsService,
    private readonly restService: RestService,
    private readonly ngbModal: NgbModal,
    private readonly gameService: GameService,
    private readonly gLink: GLinkPipe,
    private readonly messagingService: MessagingService,
    private readonly router: Router
  ) {
    this.location = location;
    this.authService.user.subscribe((u) => (this.user = u));
    this.friendsService.friends.subscribe((f) => (this.acceptedFriends = f));
    this.friendsService.pendings.subscribe((f) => (this.pendingFriends = f));
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
        this.uResults = [];
      }
    });
    this.focus.asObservable().subscribe((focused) => {
      if (!focused) {
        setTimeout(() => {
          if (!this.dontClose) {
            this.query.setValue("");
          } else {
            this.dontClose = false;
            this.searchElement.nativeElement.focus();
          }
        }, 300);
      }
    });
    this.gameService.gameStatus.subscribe((status) => {
      this.gameStatus = status;
    });
  }

  getFriendAddIcon(friend: UserModel) {
    if (this.acceptedFriends.find((f) => f.user_id === friend.id)) {
      return "fa-user-check";
    } else if (this.pendingFriends.find((f) => f.user_id === friend.id)) {
      return "fa-user-clock";
    } else {
      return "fa-user-plus";
    }
  }

  addFriend(friend: UserModel) {
    this.dontClose = true;
    const acceptedFriend = this.acceptedFriends.find(
      (f) => f.user_id === friend.id
    );
    const pendingFriend = this.pendingFriends.find(
      (f) => f.user_id === friend.id
    );
    if (acceptedFriend) {
      this.restService.deleteFriend(acceptedFriend.id).subscribe(() => {
        this.friendsService.deleteFriend(acceptedFriend);
      });
    } else if (pendingFriend) {
      this.restService.deleteFriend(pendingFriend.id).subscribe(() => {
        this.friendsService.cancelRequest(pendingFriend);
      });
    } else {
      this.restService.addFriend(friend.id).subscribe((id) => {
        this.friendsService.addFriend(friend, id);
      });
    }
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
    this.restService
      .search(value, 0, 5)
      .subscribe((games) => (this.results = games));
    this.restService
      .searchUsers(value, 0, 5)
      .subscribe((users) => (this.uResults = users));
  }

  toggleFriendsList() {
    this.toggleFriends.emit();
  }

  logout() {
    this.restService
      .deleteSession(this.authService.sessionKey)
      .subscribe(async () => {
        await this.messagingService.removeToken();
        this.authService.logout();
      });
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

  searchNavigate(tab: "games" | "users") {
    this.router.navigate(["/search", tab], {
      queryParams: { q: this.query.value },
    });
  }
}
