import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { UserModel } from "src/app/models/user.model";
import { UntypedFormControl } from "@angular/forms";
import { RestService } from "src/app/services/rest.service";
import { GameModel } from "src/app/models/game.model";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import { BehaviorSubject, Subscription, filter } from "rxjs";
import { NgbDropdown, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { GameService } from "src/app/services/game.service";
import { GameStatusRO } from "src/app/interface";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";
import { MessagingService } from "src/app/services/messaging.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { CountlyService } from "src/app/services/countly.service";
import {
  CustomCountlyEvents,
  CustomTimedCountlyEvents,
} from "src/app/services/countly";
import {
  genDefaultMenuClickSegments,
  genDefaultMenuDropdownClickSegments,
  getDefaultGuestProfileEvents,
  getGameLandingViewSource,
} from "src/app/utils/countly.util";
import { UserAgentUtil } from "src/app/utils/uagent.util";
import { NotificationService } from "src/app/services/notification.service";
import {
  FriendInterface,
  NotificationModel,
} from "src/app/models/notification.model";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  providers: [GLinkPipe],
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  public focus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public query = new UntypedFormControl("");
  public results: GameModel[] = [];
  public uResults: UserModel[] = [];
  public gameStatus: GameStatusRO | null = null;
  public hasUnread = false;
  public isAuthenticated = false;
  public showInitialUserMessage: boolean = false;
  public isHomePage: boolean = false;
  public isWarningShown: boolean = false;
  public showSearchBar: boolean = false;
  public showSearchBarForce: boolean = false;

  private user: UserModel;
  private acceptedFriends: FriendModel[] = [];
  private pendingFriends: FriendModel[] = [];
  private friendRequests: FriendModel[] = [];
  private dontClose = false;
  private keyword = "";
  private keywordHash = "";
  private isProfileFirstClicked: boolean = true;
  private logoutRef: NgbModalRef;

  private focusSubscription: Subscription;
  private gameStatusSubscription: Subscription;
  private querySubscription: Subscription;
  private userSub: Subscription;
  private friendsSub: Subscription;
  private pendingsSub: Subscription;
  private requestsSub: Subscription;
  private unreadSub: Subscription;
  private notificationCountSub: Subscription;
  private notificationsSub: Subscription;
  private currMsgSub: Subscription;
  private sessionSubscription: Subscription;
  private multiNotificationSub: Subscription;
  private _profileOverlaySub: Subscription;
  private _qParamSubscription: Subscription;
  private _guestDropdownSub: Subscription;
  private _routerSubscription: Subscription;
  private _warningMessageSub: Subscription;

  @HostListener('window:scroll', ['$event']) 
  onScroll(event) {
      this.showSearchBarForce = event.currentTarget.pageYOffset > 45;
  }

  notificationData: NotificationModel[] | null = null;
  unseenNotificationCount: number = 0;
  showMultiNotificationList: boolean = false;

  showOverlayProfile: boolean = false;
  
  @Output() toggleFriends = new EventEmitter();

  @ViewChild("search") searchElement: ElementRef;

  isMenuCollapsed = true;
  showCasualGamingLabel: boolean = false;

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
    return environment.domain + "/dashboard/login?ref=" + this.user.id;
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
      userType: this.isAuthenticated ? "registered" : "guest",
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
  get isClientSide() {
    return (UserAgentUtil.parse().app === "Oneplay App");
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
    private readonly activatedRoute: ActivatedRoute,
    private readonly countlyService: CountlyService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnDestroy(): void {
    this.focusSubscription?.unsubscribe();
    this.gameStatusSubscription?.unsubscribe();
    this.querySubscription?.unsubscribe();
    this.userSub?.unsubscribe();
    this.friendsSub?.unsubscribe();
    this.pendingsSub?.unsubscribe();
    this.requestsSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
    this.notificationCountSub?.unsubscribe();
    this.notificationsSub?.unsubscribe();
    this.currMsgSub?.unsubscribe();
    this.sessionSubscription?.unsubscribe();
    this.multiNotificationSub?.unsubscribe();
    this._profileOverlaySub?.unsubscribe();
    this._qParamSubscription?.unsubscribe();
    this._guestDropdownSub?.unsubscribe();
    this._routerSubscription?.unsubscribe();
    this._warningMessageSub?.unsubscribe();
    this.countlyService.endEvent("guestProfile");
  }

  @ViewChild("guestDropDown") guestDropDown: NgbDropdown;
  ngAfterViewInit() {
    this._guestDropdownSub = this.guestDropDown.openChange
      .asObservable()
      .subscribe((dropdownData: boolean) => {
        if (dropdownData)
          this.countlyService.startEvent("guestProfile", {
            data: getDefaultGuestProfileEvents(),
          });
        else this.countlyService.endEvent("guestProfile");
      });
  }

  ngOnInit() {
    this.sessionCountForCasualGaming();
    this.restService.getSeriousNotification().toPromise().then((data)=> {
      this.isWarningShown = data.length > 0;
      if (this.isWarningShown) {
        this._warningMessageSub = this.authService.warningMessagePresent.subscribe((value)=> {
          this.isWarningShown = value;
        })
      }
    })
    this._profileOverlaySub = this.authService.profileOverlay.subscribe(
      (data) => {
        this.showOverlayProfile = data;
        if (this.showOverlayProfile) {
          setTimeout(() => {
            this.authService.setProfileOverlay(false);
            this.authService.setTriggerInitialModal(true);
          }, 5000);
        }
      }
    );

    this.isHomePage = this.router.url.includes("home");
    this._routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
       this.isHomePage = this.router.url.includes("home");
    });

    this.userSub = this.authService.user.subscribe((u) => (this.user = u));

    this.sessionSubscription = this.authService.sessionTokenExists.subscribe(
      (exists) => {
        this.isAuthenticated = exists;
        if (exists) {
          this.initPushNotification();
          this.gameStatusSubscription = this.gameService.gameStatus.subscribe(
            (status) => {
              this.gameStatus = status;
            }
          );
        }
      }
    );

    // get Initial user info
    this._qParamSubscription = this.activatedRoute.queryParams.subscribe((qParam)=> {
      if (qParam["overlay"] && qParam["overlay"] != 'null' && !this.user?.dob) {
        this.authService.setProfileOverlay(true);
        this.router.navigate([], {queryParams: { overlay: "null" }, replaceUrl: true, queryParamsHandling: "merge"});
      }
  });

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
    this.notificationCountSub =
      this.notificationService.notificationCount.subscribe(
        (counts) => (this.unseenNotificationCount = counts)
      );
    this.notificationsSub = this.notificationService.notifications.subscribe(
      (n) => (this.notificationData = n)
    );
    this.multiNotificationSub =
      this.notificationService.showMultiNotificationList.subscribe(
        (value) => (this.showMultiNotificationList = value)
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
            // this.query.setValue("");
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
  }

  openSetting() {
    if (UserAgentUtil.parse().app === "Oneplay App") {
      window.location.href = this.domain + "/dashboard/settings/profile";
    } else {
      this.router.navigate(["settings", "profile"]);
    }
  }

  onImgError(event) {
    event.target.src = "assets/img/store/store.svg";
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

  onMouseEnter() {
    this.showSearchBar = true;
  }
  onMouseOver() {
    this.showSearchBar = window.pageYOffset > 45;
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
      userType: this.isAuthenticated ? "registered" : "guest",
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

  search(value: string) {
    this.restService.search(value, 0, 3).subscribe((res) => {
      this.results = res.results;
      this.keyword = res.keyword;
      this.keywordHash = res.keywordHash;
    });
    if (!!this.user) {
      this.restService
        .searchUsers(value, 0, 3)
        .subscribe((users) => (this.uResults = users));
    }
  }

  toggleFriendsList() {
    this.toggleFriends.emit();
  }

  async logout() {
    this.logoutRef.close();
    this.logDropdownEvent("logOutConfirmClicked");
    // wait for countly to send the req before deleting the session
    await new Promise((r) => setTimeout(r, 500));
    this.messagingService.removeToken();
    this.restService.deleteSession(this.authService.sessionKey).subscribe();
    this.authService.loggedOutByUser = true;
    this.authService.logout();
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
      userType: this.isAuthenticated ? "registered" : "guest",
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
      userType: this.isAuthenticated ? "registered" : "guest",
    });
    if (tab === "games") {
      this.countlyService.startEvent("searchResultsViewMoreGames", {
        discardOldData: true,
        data: {
          keywords: this.query.value,
          gameCardClicked: "no",
          userType: this.isAuthenticated ? "registered" : "guest",
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
          confirmButtonText: "Okay",
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

  goToSubscriptionPage() {
    this.restService.getCurrentSubscription().subscribe({
      next: (response) => {
        if (response?.length === 0) {
          this.logDropdownEvent("subscriptionClicked");
          window.open(environment.domain + "/subscription.html", "_self");
        } else {
          this.router.navigate(["/settings/subscription"]);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + err.code,
          text: err.message,
        });
      },
    });
    // domain + '/subscription.html'
  }
  goToSignUpPage(
    signInFromPage: CustomTimedCountlyEvents["signIn"]["signInFromPage"]
  ) {
    this.countlyService.startEvent("signIn", {
      data: { signInFromPage },
      discardOldData: true,
    });
    this.restService.getLogInURL().subscribe({
      next: (response) => {
        this.logDropdownEventGuest("SignInClicked");
        if (response.url === "self") {
          this.router.navigate(["/login"]);
        } else {
          window.open(`${response.url}?partner=${response.partner_id}`, '_self');
        }
      },
      error: (error) => {
        if (error?.error?.code == 307) {
          this.authService.setIsNonFunctionalRegion(true);
        } 
        this.router.navigate(["/login"]);
      },
    });
  }
  clientFun(type: 'SAVE_LOGS' | 'RUN_DIAGNOSTICS' | 'GAMEPAD_CALIBRATION') {
    if (type == "SAVE_LOGS")
      window.location.href = `oneplay:logs`;
    else if (type == "RUN_DIAGNOSTICS")
      window.location.href = `oneplay:diagnostics`;
    else if (type == "GAMEPAD_CALIBRATION")
      window.location.href = `oneplay:gamepad`;
  }

  sessionCountForCasualGaming() {

    this.restService.checkCasualGamingSession().toPromise().then((response: any)=> {
      this.showCasualGamingLabel = response.is_free;
    })
  }

  headerNavOnClick(
    item: keyof CustomCountlyEvents["menuClick"],
    canShowInitialMsg: boolean = false
  ): void {
    // this.isMenuCollapsed = true;

    // show only in desktop or table
    this.showInitialUserMessage =
      this.isAuthenticated &&
      localStorage.getItem("showTooltipInfo") &&
      canShowInitialMsg &&
      window.innerWidth > 475;

    if (this.showInitialUserMessage) {
      localStorage.removeItem("showTooltipInfo");
      setTimeout(() => {
        this.showInitialUserMessage = false;
      }, 2000);
    }
    if (this.isAuthenticated) {
      this.toggleFriends.emit("profileClicked");
    }
    this.countlyService.addEvent("menuClick", {
      ...genDefaultMenuClickSegments(),
      [item]: "yes",
    });
  }

  logDropdownEvent(item: keyof CustomCountlyEvents["menuDropdownClick"]): void {
    this.countlyService.addEvent("menuDropdownClick", {
      ...genDefaultMenuDropdownClickSegments(),
      [item]: "yes",
    });
  }
  logDropdownEventGuest(
    item: keyof CustomTimedCountlyEvents["guestProfile"]
  ): void {
    this.countlyService.updateEventData("guestProfile", {
      ...getDefaultGuestProfileEvents(),
      [item]: "yes",
    });
  }

  goToNotificationScreen() {
    if (!this.router.url.includes("notifications"))
      this.router.navigate(["/notifications"], {
        queryParams: { previousPage: this.router.url.split("/")[1] },
      });
  }

  private initPushNotification() {
    if (this.authService.notificationAlreadySubscribed) {
      return;
    }

    this.messagingService.requestToken();
    this.messagingService.receiveMessage();
    this.authService.setIsNotificationSubscribed(true);
    this.currMsgSub = this.messagingService.currentMessage.subscribe(
      (message) => {
        this.notificationService.addNotification(message);
      }
    );
  }

  private showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA,
    });
  }
}
