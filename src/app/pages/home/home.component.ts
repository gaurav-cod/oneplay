import { Component, OnInit, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Subscription } from "rxjs";
import { GameModel } from "src/app/models/game.model";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
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

  private wishlist: string[] = [];
  private wishlistSubscription: Subscription;
  private feedSubscription: Subscription;
  private gameFilterSubscription: Subscription;
  private paramsSubscription: Subscription;

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

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly countlyService: CountlyService,
  ) {}

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
    this.feedSubscription?.unsubscribe();
    this.gameFilterSubscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();
    Swal.close();
  }

  async ngOnInit() {
    this.title.setTitle("Home");
    this.loaderService.start();
    
    const response = await this.restService.getFilteredGames({"install_and_play": "true"}, 0, 5).toPromise();
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
              if(error.timeout) {
                this.router.navigateByUrl('/server-error')
              }
            }
          );
          

      },
    });

    this.wishlistSubscription = this.authService.wishlist.subscribe((ids) => {
      if (ids) {
        this.wishlist = ids;
        this.restService
          .getWishlistGames(ids)
          .subscribe((games) => (this.library = games));
      } 
    });
  }

  private async shouldShowInstallPlayTag() {
    let payload = {
      
    }
   

  }

  viewBannerGame(game: GameModel) {
    this.countlyService.startEvent("gameLandingView", {
      data: { source: 'homePage', trigger: 'banner' },
      discardOldData: true,
    });
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
   
    return games.every((game)=> game.isInstallAndPlay);
  }
}
