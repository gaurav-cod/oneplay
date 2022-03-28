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

  get isMobile() {
    return window.innerWidth < 768;
  }

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

  playVideo(
    gameLink: HTMLAnchorElement,
    image: HTMLImageElement,
    game: GameModel
  ) {
    if (game.video && !this.isMobile) {
      this.timer = setTimeout(() => {
        image.style.opacity = "0";
        this.showSound = game.oneplayId;
        const video = document.createElement("video");
        gameLink.insertAdjacentElement("afterbegin", video);
        video.classList.add("mask");
        video.src = game.video;
        video.muted = true;
        video.play();
      }, 1000);
    }
  }

  pauseVideo(
    gameLink: HTMLAnchorElement,
    image: HTMLImageElement,
    game: GameModel
  ) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (game.video && !this.isMobile) {
      image.style.opacity = "1";
      if (gameLink.firstElementChild instanceof HTMLVideoElement) {
        gameLink.removeChild(gameLink.firstElementChild);
      }
      this.showSound = "";
    }
  }

  muteUnmute(e: Event, gameLink: HTMLAnchorElement, game: GameModel) {
    e.stopPropagation();
    if (game.video) {
      const video = gameLink.firstElementChild as HTMLVideoElement;
      if (video.muted) {
        video.muted = false;
      } else {
        video.muted = true;
      }
    }
  }
}
