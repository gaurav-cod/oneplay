import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription, combineLatest, of, zip } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { UntypedFormControl } from "@angular/forms";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { UAParser } from "ua-parser-js";

@Component({
  selector: "app-onboarding-modals",
  templateUrl: "./onboarding-modals.component.html",
  styleUrls: ["./onboarding-modals.component.scss"],
})
export class OnboardingModalsComponent implements AfterViewInit, OnDestroy {
  @ViewChild("VPNAlert") VPNAlert: ElementRef<HTMLDivElement>;
  @ViewChild("iOsAlert") iOsAlert: ElementRef<HTMLDivElement>;
  @ViewChild("selectGameModal") selectGameModal: ElementRef<HTMLDivElement>;
  @ViewChild("onboardingUserModal")
  onboardingUserModal: ElementRef<HTMLDivElement>;

  games: GameModel[] = [];
  currentPage = 0;
  isLoading = false;
  canLoadMore = true;
  query = new UntypedFormControl("");
  searchText = "";
  checked: boolean = false;

  selectedGames: GameModel[] = [];
  wishlist: string[] = [];

  private _selectgameRef: NgbModalRef;
  private _onboardingUserRef: NgbModalRef;
  private wishlistSubscription: Subscription;
  private _VPNAlertRef: NgbModalRef;
  private _iOsAlertRef: NgbModalRef;
  private _showSelectGames: boolean = false;
  private _showTnC: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly ngbModal: NgbModal,
    private readonly router: Router,

    private readonly restService: RestService,
    private readonly loaderService: NgxUiLoaderService
  ) {}

  async ngAfterViewInit() {
    if (localStorage.getItem("#onboardingUser") !== "true") {
      this.onboardingUser();
      localStorage.setItem("#closeonboardingGame", "true");
    }

    this.wishlistSubscription = zip([
      this.authService.wishlist,
      this.authService.triggerWishlist,
    ]).subscribe(([wishlist, triggered]) => {
      if (triggered) {
        this.wishlist = wishlist;
        this.selectGame();
      }
    });

    this.detectiOsDevice();
    this.detectVPN();
  }

  private detectVPN() {
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (res.hosting) {
          this._VPNAlertRef = this.ngbModal.open(this.VPNAlert, {
            centered: true,
            modalDialogClass: "modal-sm",
            scrollable: true,
          });
        }
      },
    });
  }
  
  private detectiOsDevice() {
    const uagent = new UAParser();
    if(uagent.getOS().name === "iOS")
    {
      this._iOsAlertRef = this.ngbModal.open(this.iOsAlert, {
        centered: true,
        modalDialogClass: "modal-sm",
        scrollable: true,
      });
    }
  }

  cancelVPNAlert() {
    this._VPNAlertRef.close();
  }

  canceliOsAlert() {
    this._iOsAlertRef.close();
  }

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
    this._selectgameRef?.close();
    this._selectgameRef = null;
  }

  onScroll() {
    this.loadMore();
  }

  onSearch() {
    this.searchText = this.query.value.trim();
    this.canLoadMore = true;
    this.currentPage = 0;
    this.loadGames();
  }

  private selectGame() {
    this._showSelectGames = true;
    this.canLoadMore = true;
    this.currentPage = 0;
    this.loadGames();
    if (!!this._selectgameRef) return;
    this._selectgameRef = this.ngbModal.open(this.selectGameModal, {
      centered: true,
      modalDialogClass: "modal-lg",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
      windowClass: "modalZIndex1061",
    });
  }

  private loadGames() {
    this.startLoading();
    this.restService.search(this.searchText, 0, 16, "live").subscribe(
      (response) => {
        this.games = response.results.filter(
          (g) => !this.wishlist.includes(g.oneplayId)
        );
        if (response.results.length < 16) {
          this.canLoadMore = false;
        }
        this.stopLoading();
      },
      (error) => {
        this.stopLoading();
      }
    );
  }

  get orderedGames() {
    return [
      ...this.selectedGames,
      ...this.games.filter((g) => !this.selectedGameIds.includes(g.oneplayId)),
    ];
  }

  private loadMore() {
    if (this.isLoading || !this.canLoadMore) {
      return;
    }
    this.startLoading();
    this.restService
      .search(this.searchText, this.currentPage + 1, 16, "live")
      .subscribe(
        (games) => {
          this.games = [
            ...this.games,
            ...games.results.filter(
              (g) => !this.wishlist.includes(g.oneplayId)
            ),
          ];
          if (games.results.length < 16) {
            this.canLoadMore = false;
          }
          this.stopLoading();
          this.currentPage++;
        },
        (error) => {
          this.stopLoading();
        }
      );
  }

  private startLoading() {
    this.loaderService.startLoader("scroll");
    this.isLoading = true;
  }

  private stopLoading() {
    this.loaderService.stopLoader("scroll");
    this.isLoading = false;
  }

  private onboardingUser() {
    this._showTnC = true;
    this._onboardingUserRef = this.ngbModal.open(this.onboardingUserModal, {
      centered: true,
      modalDialogClass: "modal-xl",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
      windowClass: "modalZIndex1062",
    });
  }

  public closeSelectGame() {
    this._showSelectGames = false;
    this._selectgameRef.close();
    this._selectgameRef = null;
    this.selectedGameIds.forEach((id) =>
      this.restService.addWishlist(id).subscribe()
    );
    this.authService.setWishlist([...this.wishlist, ...this.selectedGameIds]);
    this.selectedGames = [];
    this.query.reset();
    this.searchText = "";
    this.triggerSpeedTest();

    // only on first time login i.e. account creation
    if (this.authService.defaultUsernameGiven)
      this.authService.startTimerToShowUserInfo();
  }

  public async closeonboardingGame() {
    this._showTnC = false;
    localStorage.setItem("#onboardingUser", "true");
    this._onboardingUserRef.close();
    this.triggerSpeedTest();
  }

  public isChecked(game: GameModel) {
    return this.selectedGameIds.includes(game.oneplayId);
  }

  public checkedValue(game: GameModel) {
    if (this.isChecked(game)) {
      this.selectedGames = this.selectedGames.filter(
        (row) => row.oneplayId !== game.oneplayId
      );
    } else {
      this.selectedGames.push(game);
    }
  }

  get domain() {
    return environment.domain;
  }

  private get selectedGameIds() {
    return this.selectedGames.map((s) => s.oneplayId);
  }

  private triggerSpeedTest() {
    if (!this.authService.trigger_speed_test) return;
    if(this.router.url.match(/\/home((\/|\?)|$)/))
    {
      if (!this._showTnC && !this._showSelectGames) {
        this.router.navigateByUrl("/speed-test");
      }
    } else {
      this.authService.trigger_speed_test = false;
    }
    
  }
}
