import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { UserInfoComponent } from "src/app/components/user-info/user-info.component";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { FriendsService } from "src/app/services/friends.service";
import { GameService } from "src/app/services/game.service";
import { NotificationService } from "src/app/services/notification.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-common-layout",
  templateUrl: "./common-layout.component.html",
  styleUrls: ["./common-layout.component.scss"],
})
export class CommonLayoutComponent implements OnInit, OnDestroy {
  public isAuthenticated = false;
  public friendsCollapsed = true;
  public stopOverflow: boolean = false;
  public username: string | null = null;

  private timer: any;
  private threeSecondsTimer: NodeJS.Timer;
  private messageTimerRef: NodeJS.Timer;
  private sessionSubscription: Subscription;
  private _qParamsSubscription: Subscription;
  private _triggerInitialModalSubscription: Subscription;
  private _userInfoRef: NgbModalRef;
  private _userInfoSubscription: Subscription;

  private clickCountForOverlay: number = 0;

  public showWelcomeMessage: boolean = false;

  showOnboardingPopup: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly partyService: PartyService,
    private readonly restService: RestService,
    private readonly gameService: GameService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly ngbModal: NgbModal,
  ) {}

  @HostListener('click', ['$event'])
  handleClick(event: Event) {
    if (localStorage.getItem("is_new_user") || this.authService.userInfoForRemindLater) {
      this.clickCountForOverlay++;
      // trigger on first three clicks
      if (this.clickCountForOverlay == 3) {
        this.authService.setUserInfoModal(true);
      }
    }
  }

  ngOnInit(): void {

    this.sessionSubscription = this.authService.sessionTokenExists.subscribe(
      async (exists) => {
        this.isAuthenticated = exists;
        if (exists) {
          this.authService.user = this.restService.getProfile();
          this.setGamingStatus();
          this.setOnline();

          if (this.timer) {
            clearInterval(this.timer);
          }

          this.timer = setInterval(() => {
            this.setGamingStatus()
          }, 10 * 1000);

          if (this.threeSecondsTimer) {
            clearInterval(this.threeSecondsTimer);
          }

          this.threeSecondsTimer = setInterval(() => {
            this.setOnline();
          }, 3 * 1000);

          if (localStorage.getItem("is_new_user")) {
            let timer: number = 5;
            this.stopOverflow = true;
            this.messageTimerRef = setInterval(()=> {
              timer--;
              if (timer == 0) {
                this.stopOverflow = false;
                clearInterval(this.messageTimerRef);
              }
            }, 500);
          }

          if (this.authService.getUserLogginFlow) {
            this.restService.getProfile().toPromise().then((response)=> {
              
              this.username = response.username;
              // Nested timeout to remove lag when program first loads
              setTimeout(()=> {
                this.showWelcomeMessage = true;
                setTimeout(()=> {
                  this.showWelcomeMessage = false;
                }, 4000);
              }, 500)
            })
          }

          this._userInfoSubscription = this.authService.userInfoModal.subscribe((value)=> {
            if (value) {
              if (!(this.router.url.includes("checkout") || this.router.url.includes("casual-gaming") || this.router.url.includes("subscription")))
              this._userInfoRef =  this.ngbModal.open(UserInfoComponent, {
                centered: true,
                modalDialogClass: "modal-md",
                backdrop: "static",
                keyboard: false,
              });
            }
          })

          if (this.authService.defaultUsernameGiven) {
            this._triggerInitialModalSubscription = this.authService.triggerInitialModal.subscribe((value)=> {
              this.showOnboardingPopup = value;
            })
          } else {
            this.showOnboardingPopup = true;
          }

          this.restService
          .getWishlist()
          .toPromise()
          .then((list) => this.authService.setWishlist(list));
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.sessionSubscription?.unsubscribe();
    this._qParamsSubscription?.unsubscribe();
    this._triggerInitialModalSubscription?.unsubscribe();
    this._userInfoSubscription?.unsubscribe();
    this._userInfoRef?.close();
    clearInterval(this.timer);
    clearInterval(this.threeSecondsTimer);
    clearInterval(this.messageTimerRef);
  }

  toggleFriendsCollapsed(event: string | undefined = undefined) {
    if (event != "profileClicked") {
      if (this.friendsCollapsed) {
        this.initFriends();
        this.initParties();
      }

      this.friendsCollapsed = !this.friendsCollapsed;
    } else {
      this.friendsCollapsed = true;
    }
  }

  private setGamingStatus() {
    this.restService
      .getGameStatus()
      .toPromise()
      .then((data) => this.gameService.setGameStatus(data));
  }

  private initFriends() {
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

  private initParties() {
    this.partyService.parties = this.restService.getParties();
    this.partyService.invites = this.restService.getPartyInvites();
  }

  private setOnline() {
    this.restService
      .setOnline()
      .toPromise()
      .then((data) => {
        this.friendsService.setUnreadSenders(data.unread_senders);
        this.notificationService.setNotificationCount(
          data.new_notification_count
        );
      });
  }
}
