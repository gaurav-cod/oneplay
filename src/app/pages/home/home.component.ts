import { Component, OnInit } from "@angular/core";
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

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {
    this.restService.getHomeFeed().subscribe((res) => {
      const games = res.games.filter((g) => g.games.length > 0);
      this.firstRow = games[0];
      this.restRows = games.slice(1);
    });
    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = wishlist)
    );
  }

  ngOnInit(): void {
    document.body.click();
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
