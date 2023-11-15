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
import { BehaviorSubject, Subscription } from "rxjs";
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
import {
  genDefaultMenuClickSegments,
  genDefaultMenuDropdownClickSegments,
  getGameLandingViewSource,
} from "src/app/utils/countly.util";
import { UserAgentUtil } from "src/app/utils/uagent.util";

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
  public hasUnread = false;

  private user: UserModel;
  private acceptedFriends: FriendModel[] = [];
  private pendingFriends: FriendModel[] = [];
  private friendRequests: FriendModel[] = [];
  private dontClose = false;
  private keyword = "";
  private keywordHash = "";
  private logoutRef: NgbModalRef;

  private focusSubscription: Subscription;
  private gameStatusSubscription: Subscription;
  private querySubscription: Subscription;
  private userSub: Subscription;
  private friendsSub: Subscription;
  private pendingsSub: Subscription;
  private requestsSub: Subscription;
  private unreadSub: Subscription;

  @Output() toggleFriends = new EventEmitter();

  @ViewChild("search") searchElement: ElementRef;

  isMenuCollapsed = true;

  get actions(): {
    [key in "add" | "accept" | "decline" | "cancel" | "wait" | "none"]: {
      icon: string;
      action: ((friend: UserModel) => any) | null;
    };
  } {
    return {
      add: {
        icon: "add-friend",
        action: (f) => this.addFriend(f),
      },
      accept: {
        icon: "Subtract",
        action: (f) => this.acceptFriend(f),
      },
      decline: {
        icon: "Cross",
        action: (f) => this.declineFriend(f),
      },
      cancel: {
        icon: "delete",
        action: (f) => this.cancelRequest(f),
      },
      wait: {
        icon: "wait-request",
        action: null,
      },
      none: {
        icon: "friend",
        action: null,
      },
    };
  }

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get photo() {
    return this.user?.photo;
  }

  get userId() {
    return this.user?.id;
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

  get appVersion() {
    return environment.appVersion;
  }

  viewGame() {
    this.headerNavOnClick("gameStatusClicked");
    if (this.gameStatus && this.gameStatus.is_running) {
      this.countlyService.endEvent("gameLandingView");
      this.countlyService.startEvent("gameLandingView", {
        data: { source: getGameLandingViewSource(), trigger: "gameStatus" },
      });
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
    this.countlyService.addEvent("search", {
      keywords: this.query.value,
      actionDone: "yes",
      actionType: "gameClicked",
    });
    this.countlyService.endEvent("gameLandingView");
    this.countlyService.startEvent("gameLandingView", {
      data: { source: getGameLandingViewSource(), trigger: "card" },
    });
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

  get showDownload() {
    return UserAgentUtil.parse().app !== "Oneplay App";
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
  ) { }

  ngOnDestroy(): void {
    this.focusSubscription?.unsubscribe();
    this.gameStatusSubscription?.unsubscribe();
    this.querySubscription?.unsubscribe();
    this.userSub?.unsubscribe();
    this.friendsSub?.unsubscribe();
    this.pendingsSub?.unsubscribe();
    this.requestsSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  ngOnInit() {
    this.userSub = this.authService.user.subscribe((u) => (this.user = u));
    this.friendsSub = this.friendsService.friends.subscribe(
      (f) => (this.acceptedFriends = f)
    );
    this.pendingsSub = this.friendsService.pendings.subscribe(
      (f) => (this.pendingFriends = f)
    );
    this.requestsSub = this.friendsService.requests.subscribe(
      (f) => (this.friendRequests = f)
    );
    this.unreadSub = this.friendsService.unreadSenders.subscribe(
      (ids) => (this.hasUnread = ids.length > 0)
    );
    const debouncedSearch = AwesomeDebouncePromise(
      (value) => this.search(value),
      500
    );
    this.querySubscription = this.query.valueChanges.subscribe((value) => {
      if (value.trim() !== "") {
        debouncedSearch(value);
      } else {
        this.results = [];
        this.uResults = [];
      }
    });
    this.focusSubscription = this.focus.asObservable().subscribe((focused) => {
      setTimeout(() => {
        if (!this.dontClose) {
          this.isMenuCollapsed = !focused;
          if (focused) {
            this.restService
              .getAllFriends()
              .toPromise()
              .then((friends) => this.friendsService.setFriends(friends));
            this.restService
              .getPendingSentRequests()
              .toPromise()
              .then((pendings) => this.friendsService.setPendings(pendings));
            this.restService
              .getPendingReceivedRequests()
              .toPromise()
              .then((requests) => this.friendsService.setRequests(requests));
          }
        }
      }, 300);

      if (!focused) {
        setTimeout(() => {
          if (!this.dontClose) {
            this.query.setValue("");
          } else {
            this.dontClose = false;
            this.searchElement.nativeElement.focus();
          }
        }, 300);
      } else if (this.query.value == "") {
        this.restService.search("", 0, 3).subscribe((res) => {
          this.results = res.results;
          this.keyword = res.keyword;
          this.keywordHash = res.keywordHash;
        });
      }
    });
    this.gameStatusSubscription = this.gameService.gameStatus.subscribe(
      (status) => {
        this.gameStatus = status;
      }
    );
  }

  openSetting() {
    if (UserAgentUtil.parse().app === "Oneplay App") {
      window.location.href = this.domain + "/dashboard/settings/profile";
    } else {
      this.router.navigate(["settings", "profile"]);
    }
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

  getActions(friend: UserModel) {
    if (this.acceptedFriends.find((f) => f.user_id === friend.id)) {
      return ["none"];
    } else if (this.pendingFriends.find((f) => f.user_id === friend.id)) {
      return ["cancel", "wait"];
    } else if (this.friendRequests.find((f) => f.user_id === friend.id)) {
      return ["decline", "accept"];
    } else {
      return ["add"];
    }
  }

  private acceptFriend(friend: UserModel) {
    this.dontClose = true;
    const request = this.friendRequests.find((f) => f.user_id === friend.id);
    if (request) {
      this.restService.acceptFriend(request.id).subscribe({
        next: () => this.friendsService.acceptRequest(request),
        error: (err) => this.showError(err),
      });
    }
  }

  private declineFriend(friend: UserModel) {
    this.dontClose = true;
    const request = this.friendRequests.find((f) => f.user_id === friend.id);
    if (request) {
      this.restService.deleteFriend(request.id).subscribe({
        next: () => this.friendsService.declineRequest(request),
        error: (err) => this.showError(err),
      });
    }
  }

  private cancelRequest(friend: UserModel) {
    this.dontClose = true;
    const request = this.pendingFriends.find((f) => f.user_id === friend.id);
    if (request) {
      this.restService.deleteFriend(request.id).subscribe({
        next: () => this.friendsService.cancelRequest(request),
        error: (err) => this.showError(err),
      });
    }
  }

  private addFriend(friend: UserModel) {
    this.dontClose = true;
    this.countlyService.addEvent("search", {
      keywords: this.query.value,
      actionDone: "yes",
      actionType: "addFriend",
    });
    const record = [
      ...this.acceptedFriends,
      ...this.pendingFriends,
      ...this.friendRequests,
    ].find((f) => f.user_id === friend.id);
    if (!record) {
      this.restService.addFriend(friend.id).subscribe({
        next: (id) => this.friendsService.addFriend(friend, id),
        error: (err) => this.showError(err),
      });
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

  async logout() {
    this.logoutRef.close();
    this.logDropdownEvent("logOutConfirmClicked");
    // wait for countly to send the req before deleting the session
    await new Promise((r) => setTimeout(r, 500));
    // this.messagingService.removeToken().finally(() => {
    this.restService.deleteSession(this.authService.sessionKey).subscribe();
    this.authService.loggedOutByUser = true;
    this.authService.logout();
    // });
  }

  LogoutAlert(container) {
    this.logDropdownEvent("logOutClicked");
    this.logoutRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  deleteSessionData() {
    this.logDropdownEvent("deleteSessionDataClicked");
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete all your session data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        this.logDropdownEvent("deleteSessionDataConfirmClicked");
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
    this.countlyService.addEvent("search", {
      keywords: this.query.value,
      actionDone: "no",
      actionType: "cancelled",
    });
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
    this.countlyService.addEvent("search", {
      keywords: this.query.value,
      actionDone: "yes",
      actionType: tab === "games" ? "seeMoreGames" : "seeMoreUsers",
    });
    if (tab === "games") {
      this.countlyService.startEvent("searchResultsViewMoreGames", {
        discardOldData: true,
        data: {
          keywords: this.query.value,
          gameCardClicked: "no",
        },
      });
    } else if (tab === "users") {
      this.countlyService.startEvent("searchResultsViewMoreUsers", {
        discardOldData: true,
        data: {
          keywords: this.query.value,
          friendRequestClicked: "no",
        },
      });
    }
    this.router.navigate(["/search", tab], {
      queryParams: { q: this.query.value },
    });
  }

  switchSearchPrivacy() {
    const privacy = !this.isPrivate;
    this.logDropdownEvent(
      privacy ? "turnOffPrivacyDisabled" : "turnOffPrivacyEnabled"
    );
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

  headerNavOnClick(item: keyof CustomCountlyEvents["menuClick"]): void {
    // this.isMenuCollapsed = true;

    this.countlyService.addEvent("menuClick", {
      ...genDefaultMenuClickSegments(),
      [item]: "yes",
    });
    this.router.navigate(['settings/profile']);
  }

  logDropdownEvent(item: keyof CustomCountlyEvents["menuDropdownClick"]): void {
    this.countlyService.addEvent("menuDropdownClick", {
      ...genDefaultMenuDropdownClickSegments(),
      [item]: "yes",
    });
  }
}
