import { Component, OnInit } from "@angular/core";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  firstRow: GameFeedModel;
  restRows: GameFeedModel[] = [];
  loadingWishlist = false;

  private wishlist: string[] = [];

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
  ) {
      }

  ngOnInit(): void {
    this.loaderService.start();
    this.restService.getHomeFeed().subscribe((res) => {
      const games = res.games.filter((g) => g.games.length > 0);
      this.firstRow = games[0];
      this.restRows = games.slice(1);
      document.body.click();
      this.loaderService.stop();
    });
    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = wishlist)
    );
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
