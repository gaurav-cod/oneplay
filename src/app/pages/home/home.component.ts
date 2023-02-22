import { Component, OnInit, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Subscription } from "rxjs";
import { GameModel } from "src/app/models/game.model";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
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
  private userSubscription: Subscription;
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

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly router: Router,
  ) {}

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
    this.feedSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.gameFilterSubscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.title.setTitle("Home");
    this.loaderService.start();
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
          .subscribe((games) => (this.genreGames = games));
        }
        this.feedSubscription = this.restService
          .getHomeFeed()
          .subscribe((res) => {
              const games = res.games.filter((g) => g.games.length > 0);
              this.firstRow = games[0];
              this.restRows = games.slice(1);
              document.body.click();
              this.loaderService.stop();
            },
            (error) => {
              if(error.timeout) {
                this.router.navigateByUrl('/server-error')
              }
            }
          );

      },
    });
    this.userSubscription = this.authService.user.subscribe((user) => {
      if (user.status !== "active") {
        Swal.fire({
          icon: "warning",
          title: "Hi, " + user.firstName,
          html: `Your account is yet to be verified. Please give us 24 hrs to do so.
          Until then, kindly <a href="${environment.domain}/download.html">download client</a> info from our website
          Thankyou for your patience!`,
          confirmButtonText: "OK",
        });
      }
    });

    this.wishlistSubscription = this.authService.wishlist.subscribe((ids) => {
      this.wishlist = ids;
      this.restService
        .getWishlistGames(ids)
        .subscribe((games) => (this.library = games));
    });
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
}
