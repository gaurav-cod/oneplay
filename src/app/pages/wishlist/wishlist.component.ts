import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { GameModel } from "src/app/models/game.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-wishlist",
  templateUrl: "./wishlist.component.html",
  styleUrls: ["./wishlist.component.scss"],
})
export class WishlistComponent implements OnInit {
  games: GameModel[] = [];

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle("OnePlay | Wishlist");
    this.authService.wishlist.subscribe((ids) => {
      this.restService
        .getWishlistGames(ids)
        .subscribe((games) => (this.games = games));
    });
  }
}
