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

  showSound = "";
  timer: NodeJS.Timeout;

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

  playVideo(video: HTMLVideoElement, image: HTMLImageElement, game: GameModel) {
    if (game.video && window.innerWidth > 768) {
      this.timer = setTimeout(() => {
        image.style.opacity = "0";
        this.showSound = game.oneplayId;
        video.muted = true;
        video.play();
      }, 1000);
    }
  }

  pauseVideo(
    video: HTMLVideoElement,
    image: HTMLImageElement,
    game: GameModel
  ) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (game.video && window.innerWidth > 768) {
      image.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
      this.showSound = "";
    }
  }

  muteUnmute(e: Event, video: HTMLVideoElement, game: GameModel) {
    e.stopPropagation();
    if (game.video) {
      if (video.muted) {
        video.muted = false;
      } else {
        video.muted = true;
      }
    }
  }
}
