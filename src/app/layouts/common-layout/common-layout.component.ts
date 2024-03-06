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
  private queryParamSubscription: Subscription;
  private _openUserInfoModal: NodeJS.Timer;

  private clickCountForOverlay: number = 0;

  public showWelcomeMessage: boolean = false;
  public isApp: boolean = localStorage.getItem("src") === "oneplay_app";;

  showOnboardingPopup: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly partyService: PartyService,
    private readonly restService: RestService,
    private readonly gameService: GameService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ngbModal: NgbModal,
  ) {}

  get isHomePage() {
    return this.router.url.includes("home");
  }

  @HostListener('click', ['$event'])
  handleClick(event: Event) {
    if (localStorage.getItem("showUserInfoModal")) {
      if (!(this.router.url.includes("checkout") || this.router.url.includes("casual-games") || this.router.url.includes("subscription") || this.router.url.includes("speed-test"))) {
        this.clickCountForOverlay++;
        // trigger on first three clicks
        if (this.clickCountForOverlay == 3) {
          this.authService.setUserInfoModal(true);
        }
      }
    }
  }

  ngOnInit(): void {
    this.queryParamSubscription = this.activatedRoute.queryParams.subscribe((params) => {
      if (params.src === "oneplay_app") {
        localStorage.setItem("src", "oneplay_app");
        this.isApp = true;
      } else if (localStorage.getItem("src") === "oneplay_app") {
        localStorage.removeItem("src");
        this.isApp = false;
      }
    });

    this.sessionSubscription = this.authService.sessionTokenExists.subscribe(
      async (exists) => {
        this.isAuthenticated = exists;
        if (exists) {
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
            }, 2000);
          }

          if (localStorage.getItem("showWelcomBackMsg")) {
            localStorage.removeItem("showWelcomBackMsg");
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
           
            if (value && localStorage.getItem("showUserInfoModal") && !localStorage.getItem("showAddToLibrary")) {
              if (!(this.router.url.includes("checkout") || this.router.url.includes("casual-games") || this.router.url.includes("subscription") || this.router.url.includes("speed-test"))) {
                clearInterval(this._openUserInfoModal);
                this._userInfoRef =  this.ngbModal.open(UserInfoComponent, {
                  centered: true,
                  modalDialogClass: "modal-md",
                  backdrop: "static",
                  keyboard: false,
                });
              } else {
                clearInterval(this._openUserInfoModal);
                this._openUserInfoModal = setInterval(()=> {
                  this.authService.setUserInfoModal(true);
                }, 1000);
              }
            }
          })

          if (localStorage.getItem("is_new_user")) {
            setTimeout(()=> {
              this.showOnboardingDelay();
            }, 5000); 
          } else {
            this.showOnboardingDelay();
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
    this.queryParamSubscription?.unsubscribe();
    this._userInfoRef?.close();
    clearInterval(this.timer);
    clearInterval(this.threeSecondsTimer);
    clearInterval(this.messageTimerRef);

    // reset temp variable
    this.showWelcomeMessage = false;
    this.stopOverflow = false;
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

  private showOnboardingDelay() {
    if (localStorage.getItem("showAddToLibrary")) {
      this._triggerInitialModalSubscription = this.authService.triggerInitialModal.subscribe((value)=> {
        this.showOnboardingPopup = value;
      })
    } else {
      this.showOnboardingPopup = true;
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
