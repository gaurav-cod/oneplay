import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { GameStatusRO } from 'src/app/interface';
import { GameModel } from 'src/app/models/game.model';
import { UserModel } from 'src/app/models/user.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from 'src/app/services/game.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  providers: [GLinkPipe],
})

export class BottomNavComponent implements OnInit, OnDestroy {

  @Output() toggleFriends = new EventEmitter();
  @ViewChild("TermsAndConditions") TermsAndConditions: ElementRef<HTMLDivElement >;
  
  public gameStatus: GameStatusRO | null = null;
  private user: UserModel;
  private userSubscription: Subscription;
  private gameStatusSubscription: Subscription;

  constructor(
    private readonly messagingService: MessagingService,
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly gameService: GameService,
    private readonly gLink: GLinkPipe,
    private readonly ngbModal: NgbModal,
  ) { }

  private _TermsAndConditionsRef: NgbModalRef;
  
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.gameStatusSubscription.unsubscribe();
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

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get link() {
    return "https://www.oneplay.in/dashboard/register?ref=" + this.user.id;
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

  ngOnInit(): void {
    this.gameStatusSubscription = this.gameService.gameStatus.subscribe((status) => {
      this.gameStatus = status;
    });

    this.userSubscription = this.authService.user.subscribe((user) => {
      this.user = user;
    });

  }

  toggleFriendsList() {
    this.toggleFriends.emit();
  }

  logout() {
    this.messagingService.removeToken().finally(() => {
      this.restService.deleteSession(this.authService.sessionKey).subscribe();
      this.authService.logout();
    });
  }
  
  open(container) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  private TermsConditions() {
    this._TermsAndConditionsRef = this.ngbModal.open(this.TermsAndConditions, {
      centered: true,
      modalDialogClass: "modal-md",
      scrollable: true,
    });
  }
  
}
