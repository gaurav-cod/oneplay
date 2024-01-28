import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { GameModel } from "src/app/models/game.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-wishlist",
  templateUrl: "./wishlist.component.html",
  styleUrls: ["./wishlist.component.scss"],
})
export class WishlistComponent implements OnInit, OnDestroy {
  @ViewChild("selectGameModal") selectGameModal: ElementRef<HTMLDivElement>;

  games: GameModel[] = [];
  private wishlistSubscription: Subscription;
  selectedGames: GameModel[] = [];

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly title: Title,
  ) {}

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.title.setTitle("OnePlay | Wishlist");
    this.wishlistSubscription = this.authService.wishlist.subscribe((ids) => {
      if (ids) {
        this.restService
          .getWishlistGames(ids)
          .subscribe((games) => (this.selectedGames = games));
      }
    });
  } 

  selectGame() {
    localStorage.setItem("showAddToLibrary", "true");
    this.authService.openWishlist();
  }
}
