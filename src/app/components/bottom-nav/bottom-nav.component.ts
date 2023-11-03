import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Router } from "@angular/router";
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
  downloadAlert: boolean = true;

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
  ) {}

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.gameStatusSubscription.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  viewGame() {
    if (this.gameStatus && this.gameStatus.is_running) {
      this.countlyService.endEvent("gameLandingView")
      this.countlyService.startEvent("gameLandingView", {
        data: {source: getGameLandingViewSource(), trigger: 'gameStatus' },
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
    return environment.domain + "/dashboard/register?ref=" + this.user.id;
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
  }

  // toggleFriendsList() {
  //   this.toggleFriends.emit();
  // }

  logout() {
    this.messagingService.removeToken().finally(() => {
      this.restService.deleteSession(this.authService.sessionKey).subscribe();
      this.authService.loggedOutByUser = true;
      this.authService.logout();
    });
  }

  open(container) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  TermsConditions(container: ElementRef<HTMLDivElement>) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
      scrollable: true,
    });
  }
}
