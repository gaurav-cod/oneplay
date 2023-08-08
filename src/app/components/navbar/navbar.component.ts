import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { UserModel } from "src/app/models/user.model";
import { UntypedFormControl } from "@angular/forms";
import { RestService } from "src/app/services/rest.service";
import { GameModel } from "src/app/models/game.model";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { BehaviorSubject } from "rxjs";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { GameService } from "src/app/services/game.service";
import { GameStatusRO } from "src/app/interface";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";
import { MessagingService } from "src/app/services/messaging.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { AvatarPipe } from "src/app/pipes/avatar.pipe";
import { CountlyService } from "src/app/services/countly.service";
import { CustomCountlyEvents } from "src/app/services/countly";
import { genDefaultMenuClickSegments, genDefaultSettingsViewSegments } from "src/app/utils/countly.util";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  providers: [GLinkPipe],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public focus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public query = new UntypedFormControl("");
  public results: GameModel[] = [];
  public uResults: UserModel[] = [];
  public gameStatus: GameStatusRO | null = null;
  public notifications = [];

  private user: UserModel;
  private acceptedFriends: FriendModel[] = [];
  private pendingFriends: FriendModel[] = [];
  private dontClose = false;
  private keyword = "";
  private keywordHash = "";
  private logoutRef: NgbModalRef;

  @Output() toggleFriends = new EventEmitter();

  @ViewChild("search") searchElement: ElementRef;

  isMenuCollapsed = true;

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get photo() {
    return this.user?.photo;
  }

  get isFocused() {
    return this.focus.asObservable();
  }

  get link() {
    return environment.domain + "/dashboard/register?ref=" + this.user.id;
  }

  get domain() {
    return environment.domain;
  }

  viewGame() {
    if (this.gameStatus && this.gameStatus.is_running) {
      // this.countlyService.addEvent("gameLandingView", {
      //   gameID: this.gameStatus.game_id,
      //   gameGenre: "",
      //   gameTitle: this.gameStatus.game_name,
      //   source: location.pathname + location.hash,
      //   trigger: "navbar - game-status",
      //   channel: "web",
      // });
      const path = [
        "view",
        this.gLink.transform({
          title: this.gameStatus.game_name,
          oneplayId: this.gameStatus.game_id,
        } as GameModel),
      ];
      this.router.navigate(path);
    }
  }

  viewGameFromSearch(game: GameModel) {
    this.isMenuCollapsed = true;
    // this.countlyService.addEvent("search", {
    //   term: this.query.value,
    //   actionDone: "yes",
    //   actionType: "NA",
    //   page: location.pathname.replace('/dashboard/',''),
    //   channel: "web"
    // })
    // this.countlyService.addEvent("gameLandingView", {
    //   gameID: game.oneplayId,
    //   gameGenre: game.genreMappings?.join(","),
    //   gameTitle: game.title,
    //   source: location.pathname + location.hash,
    //   trigger: "navbar - search",
    //   channel: "web",
    // });
    // this.countlyService.endEvent("searchResultsViewMoreGames", {
    //   gameCardClicked: "yes",
    //   gameID: game.oneplayId,
    //   gameTitle: game.title,
    //   channel: "web",
    // })
    this.router.navigate(["view", this.gLink.transform(game)], {
      queryParams: this.keywordQuery,
    });
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

  constructor(
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly restService: RestService,
    private readonly ngbModal: NgbModal,
    private readonly gameService: GameService,
    private readonly gLink: GLinkPipe,
    private readonly messagingService: MessagingService,
    private readonly router: Router,
    private readonly countlyService: CountlyService
  ) {
    this.authService.user.subscribe((u) => (this.user = u));
    this.friendsService.friends.subscribe((f) => (this.acceptedFriends = f));
    this.friendsService.pendings.subscribe((f) => (this.pendingFriends = f));
  }

  ngOnDestroy(): void {
    Swal.close();
  }

  ngOnInit() {
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

  onImgError(event) {
    event.target.src = "assets/img/default_bg.webp";
  }

  onUserError(event) {
    event.target.src = "assets/img/defaultUser.svg";
  }

  onUsersError(event) {
    event.target.src = "assets/img/defaultUser.svg";
  }

  getFriendAddIcon(friend: UserModel) {
    if (this.acceptedFriends.find((f) => f.user_id === friend.id)) {
      return "fa-user-check";
    } else if (this.pendingFriends.find((f) => f.user_id === friend.id)) {
      return "fa-user-clock";
    } else if (this.user.id === friend.id) {
      return "d-none";
    } else {
      return "fa-user-plus";
    }
  }

  addFriend(friend: UserModel) {
    // this.countlyService.addEvent("search", {
    //   term: this.query.value,
    //   actionDone: "yes",
    //   actionType: "NA",
    //   page: location.pathname.replace('/dashboard/',''),
    //   channel: "web"
    // })
    // this.countlyService.endEvent("searchResultsViewMoreUsers", {
    //   term: this.query.value,
    //   "friend request clicked": "yes",
    //   userID: friend.id,
    // })
    if (this.user.id === friend.id) {
      return;
    }
    this.dontClose = true;
    const acceptedFriend = this.acceptedFriends.find(
      (f) => f.user_id === friend.id
    );
    const pendingFriend = this.pendingFriends.find(
      (f) => f.user_id === friend.id
    );
    if (acceptedFriend) {
      this.restService.deleteFriend(acceptedFriend.id).subscribe(
        () => {
          this.friendsService.deleteFriend(acceptedFriend);
        },
        (err) => this.showError(err)
      );
    } else if (pendingFriend) {
      this.restService.deleteFriend(pendingFriend.id).subscribe(
        () => {
          this.friendsService.cancelRequest(pendingFriend);
        },
        (err) => this.showError(err)
      );
    } else {
      this.restService.addFriend(friend.id).subscribe(
        (id) => {
          this.friendsService.addFriend(friend, id);
        },
        (err) => this.showError(err)
      );
    }
  }

  private showError(error) {
    Swal.fire({
      icon: "error",
      title: "Error Code: " + error.code,
      text: error.message,
    });
  }

  search(value: string) {
    this.restService.search(value, 0, 3).subscribe((res) => {
      this.results = res.results;
      this.keyword = res.keyword;
      this.keywordHash = res.keywordHash;
    });
    this.restService
      .searchUsers(value, 0, 3)
      .subscribe((users) => (this.uResults = users));
  }

  toggleFriendsList() {
    this.toggleFriends.emit();
  }

  logout() {
    this.logoutRef.close();
    this.logCountly('logOutClicked');
    this.messagingService.removeToken().finally(() => {
      this.restService.deleteSession(this.authService.sessionKey).subscribe();
      this.authService.loggedOutByUser = true;
      this.authService.logout();
    });
  }

  LogoutAlert(container) {
    this.logoutRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  deleteSessionData() {
    this.logCountly('deleteSessionDataClicked');
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete all your session data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        this.logCountly('deleteSessionDataConfirmClicked');
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
      scrollable: true,
    });
  }

  TermsConditions(container: ElementRef<HTMLDivElement>) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
      scrollable: true,
    });
  }

  searchNavigate(tab: "games" | "users") {
    // this.countlyService.addEvent("search", {
    //   term: this.query.value,
    //   actionDone: "yes",
    //   actionType: tab === "games" ? "See more Games" : "See more Users",
    //   page: location.pathname.replace('/dashboard/',''),
    //   channel: "web"
    // })
    // if (tab === "games") this.countlyService.startEvent("searchResultsViewMoreGames", {
    //   data: {
    //     term: this.query.value,
    //     channel: "web",
    //   }
    // })
    // else this.countlyService.startEvent("searchResultsViewMoreUsers", {
    //   data: { term: this.query.value } })
    this.router.navigate(["/search", tab], {
      queryParams: { q: this.query.value },
    });
  }

  switchSearchPrivacy() {
    const privacy = !this.isPrivate;
    this.logCountly(privacy ? 'turnOffPrivacyDisabled' : 'turnOffPrivacyEnabled')
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

  logCountly(
    item: keyof CustomCountlyEvents['menuClick']
  ): void {
    this.countlyService.addEvent("menuClick", {
      ...genDefaultMenuClickSegments(),
      [item]: 'yes',
    })
  }

  // logCountly(Type: string) {
  // logCountly(Type: CustomSegments["menuClick"]["Type"]) {
    // this.countlyService.addEvent("menuClick", { Type });
  // }
}
