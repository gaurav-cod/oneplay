import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Input,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { GameStatusRO } from "src/app/interface";
import { GameModel } from "src/app/models/game.model";
import { UserModel } from "src/app/models/user.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { FriendsService } from "src/app/services/friends.service";
// import { CountlyService } from "src/app/services/countly.service";
import { GameService } from "src/app/services/game.service";
import { MessagingService } from "src/app/services/messaging.service";
import { RestService } from "src/app/services/rest.service";
import { getGameLandingViewSource } from "src/app/utils/countly.util";
import { environment } from "src/environments/environment";
import UAParser from "ua-parser-js";

enum BOTTOM_NAV {
  HOME = "HOME",
  GAME = "GAME",
  LIVE = "LIVE",
  SPEED_TEST = "SPEED_TEST",
  CHAT = "CHAT"
}

@Component({
  selector: "app-bottom-nav",
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.scss"],
  providers: [GLinkPipe],
})
export class BottomNavComponent implements OnInit, OnDestroy {
  // @Output() toggleFriends = new EventEmitter();


  public gameStatus: GameStatusRO | null = null;
  public hasUnread = false;
  private user: UserModel;
  private userSubscription: Subscription;
  private gameStatusSubscription: Subscription;
  private unreadSub: Subscription;
  public selectedBottomNav: BOTTOM_NAV = null;
  downloadAlert: boolean = true;

  private routerSub: Subscription;
  private _sessionSubscription: Subscription;

  showCasualGamingLabel: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private readonly messagingService: MessagingService,
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly gameService: GameService,
    private readonly friendsService: FriendsService,
    private readonly gLink: GLinkPipe,
    private readonly ngbModal: NgbModal,
    private readonly router: Router,
    private readonly countlyService: CountlyService
  ) {
    this.selectedBottomNav = this.getCurrentSelectedTab(this.router.url)
    this.routerSub = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.selectedBottomNav = this.getCurrentSelectedTab(event.url);
      }
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.gameStatusSubscription.unsubscribe();
    this.unreadSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    this._sessionSubscription?.unsubscribe();
  }

  viewGame() {
    if (this.gameStatus && this.gameStatus.is_running) {
      this.countlyService.endEvent("gameLandingView")
      this.countlyService.startEvent("gameLandingView", {
        data: { source: getGameLandingViewSource(), trigger: 'gameStatus' },
      })
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

  get isGameRunning() {
    return this.gameStatus && this.gameStatus.is_running;
  }

  get isUserLive() {
    return this.gameStatus && this.gameStatus.is_user_connected;
  }

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get link() {
    return environment.domain + "/dashboard/login?ref=" + this.user.id;
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

  get isAndroid() {
    const uagent = new UAParser();
    return (
      uagent.getOS().name === "Android" && uagent.getDevice().type !== "smarttv"
    );
  }

  closeAlert() {
    this.downloadAlert = false;
  }

  ngOnInit(): void {
    this._sessionSubscription = this.authService.sessionTokenExists.subscribe(
      (exists) => {
        this.isAuthenticated = exists;
      }
    );
    this.unreadSub = this.friendsService.unreadSenders.subscribe(
      (ids) => (this.hasUnread = ids.length > 0)
    );
    this.gameStatusSubscription = this.gameService.gameStatus.subscribe(
      (status) => {
        this.gameStatus = status;
      }
    );

    this.userSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });

    this.sessionCountForCasualGaming();
  }

  // toggleFriendsList() {
  //   this.toggleFriends.emit();
  // }

  logout() {
    this.messagingService.removeToken()
    this.restService.deleteSession(this.authService.sessionKey).toPromise();
    this.authService.loggedOutByUser = true;
    this.authService.logout();
  }

  open(container) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  goToSignUpPage() {
    this.restService.getLogInURL().subscribe({
      next: (response) => {
        if (response.url === "self") {
          this.router.navigate(["/login"]);
        } else {
          window.open(`${response.url}?partner=${response.partner_id}`, '_self');
        }
      },
      error: () => {
        this.router.navigate(["/login"]);
      },
    });
  }

  TermsConditions(container: ElementRef<HTMLDivElement>) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
      scrollable: true,
    });
  }

  sessionCountForCasualGaming() {

    this.restService.checkCasualGamingSession().toPromise().then((response: any)=> {
      this.showCasualGamingLabel = response.is_free;
    })
  
  }

  getCurrentSelectedTab(currentUrl: string): BOTTOM_NAV {
    switch (currentUrl) {
      case '/chat':
        return BOTTOM_NAV.CHAT;
      case '/store':
        return BOTTOM_NAV.GAME;
      case '/':
      case '/home':
        return BOTTOM_NAV.HOME;
      case '/speed-test':
        return BOTTOM_NAV.SPEED_TEST;
      case '/live':
        return BOTTOM_NAV.LIVE;
    }
  }
}
