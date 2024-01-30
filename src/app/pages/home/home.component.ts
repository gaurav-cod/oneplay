import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Subscription } from "rxjs";
import { GameModel } from "src/app/models/game.model";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { UserModel } from "src/app/models/user.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { ToastService } from "src/app/services/toast.service";
import { getDefaultHomeClickSegments } from "src/app/utils/countly.util";
import Swal from "sweetalert2";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [GLinkPipe],
})
export class HomeComponent implements OnInit, OnDestroy {
  firstRow: GameFeedModel;
  restRows: GameFeedModel[] = [];
  loadingWishlist = false;
  library: GameModel[] = [];
  genreGames: GameModel[] = [];
  genreSelected: string = '';

  firstSignUpMsgTimer: number | null = null;

  private userDetails: UserModel | null = null;
  private wishlist: string[] = [];
  private wishlistSubscription: Subscription;
  private feedSubscription: Subscription;
  private gameFilterSubscription: Subscription;
  private paramsSubscription: Subscription;
  private _qParamsSubscription: Subscription;
  private _userSubscription: Subscription;
  private _userInfoRef: NgbModalRef;

  private messageTimer: NodeJS.Timer;

  private queries = {
    "Free to Play": {
      is_free: "true",
    },
    Action: { genres: "Action" },
    Adventure: { genres: "Adventure" },
    Casual: { genres: "Casual" },
    RPG: { genres: "RPG" },
    Racing: { genres: "Racing" },
  };

  get routes() {
    return Object.keys(this.queries);
  }

  get showNavigation(): boolean {
    return window.innerWidth < 768;
  }

  get showIndicator(): boolean {
    return window.innerWidth > 768;
  }

  get allGamesLength(): number {
    return [...this.restRows, ...this.genreGames].length;
  }

  get username(): string | null {
    return this.userDetails?.username;
  }

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly countlyService: CountlyService,
    private readonly ngbModal: NgbModal,
    private readonly toastService: ToastService
  ) { }

  ngOnDestroy(): void {
    this.countlyService.endEvent("homeView");
    this.wishlistSubscription?.unsubscribe();
    this.feedSubscription?.unsubscribe();
    this.gameFilterSubscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();
    this._qParamsSubscription?.unsubscribe();
    this._userSubscription?.unsubscribe();
    this._userInfoRef?.close();
    clearInterval(this.messageTimer);
    Swal.close();
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    event.preventDefault();
    this.countlyService.endEvent("homeView");
  }

  async ngOnInit() {

    this.title.setTitle("Home");
    this.loaderService.start();

    this.countlyService.startEvent("homeView", {
      data: getDefaultHomeClickSegments(),
      discardOldData: true,
    });

    const response = await this.restService.getFilteredGames({ "install_and_play": "true" }, 0, 5).toPromise();
    if (response.length === 5) {
      this.queries["Install & Play"] = {
        "install_and_play": "true"
      };
    }
    this.paramsSubscription = this.route.params.subscribe({
      next: (params) => {
        this.feedSubscription?.unsubscribe();
        this.gameFilterSubscription?.unsubscribe();
        const query = params.filter;
        if (!query) {
          this.genreSelected = '';
        } else {

          this.genreSelected = query;
          this.gameFilterSubscription = this.restService
            .getFilteredGames(this.queries[query], 0)
            .subscribe((games) => {
              this.countlyService.updateEventData("homeView", {filterClicked: query});
              this.genreGames = games;
            });
        }
        this.feedSubscription = this.restService
          .getHomeFeed()
          .subscribe((res) => {
            const feeds = res.filter((f) => f.games.length > 0);
            this.firstRow = feeds.filter((f) => f.type === 'header')[0];
            // this.installPlayRow = feeds.filter((f) => f.title === "Test Feed")[0];
            this.restRows = feeds.filter((f) => f.type === 'rail');

            document.body.click();
            this.loaderService.stop();
          },
            (error) => {
              this.loaderService.stop();
              if (error.timeout) {
                this.router.navigateByUrl('/server-error')
              }
            }
          );
      },
    });
    this._userSubscription = this.authService.user.subscribe((user) => {
      this.userDetails = user;
    });

    if (localStorage.getItem("is_new_user")) {
      localStorage.removeItem("is_new_user");
      this.firstSignUpMsgTimer = 5;
      this.messageTimer = setInterval(() => {
        this.firstSignUpMsgTimer--;
        if (this.firstSignUpMsgTimer == 0) {
          this.authService.setTriggerInitialModal(true);
          clearInterval(this.messageTimer);
        }
      }, 5000);
    }

    this.wishlistSubscription = this.authService.wishlist.subscribe((ids) => {
      if (ids) {
        this.wishlist = ids;
        this.restService
          .getWishlistGames(ids)
          .subscribe((games) => (this.library = games));
      }
    });
  }

  viewBannerGame(game: GameModel) {
    this.countlyService.startEvent("gameLandingView", {
      data: { source: 'homePageBanner', trigger: 'banner' },
      discardOldData: true,
    });
    this.countlyService.updateEventData("homeView", { bannerClicked: game.title })
    this.router.navigate(['view', this.gLink.transform(game)]);
  }

  isInWishlist(game: GameModel): boolean {
    return this.wishlist.includes(game.oneplayId);
  }

  addToWishlist(game: GameModel): void {
    this.loadingWishlist = true;
    this.restService.addWishlist(game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.addToWishlist(game.oneplayId);
    });
  }

  removeFromWishlist(game: GameModel): void {
    this.loadingWishlist = true;
    this.restService.removeWishlist(game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.removeFromWishlist(game.oneplayId);
    });
  }

  isInstallPlayList(games: GameModel[]) {

    return games.every((game) => game.isInstallAndPlay);
  }
}
