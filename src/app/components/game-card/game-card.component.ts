import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { CountlyService } from "src/app/services/countly.service";
import { environment } from "src/environments/environment";
import { v4 } from "uuid";

@Component({
  selector: "app-game-card",
  templateUrl: "./game-card.component.html",
  styleUrls: ["./game-card.component.scss"],
  providers: [GLinkPipe],
})
export class GameCardComponent implements OnInit {
  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input("hasFixedWidth") hfw: boolean = false;

  timer: NodeJS.Timeout;
  muted = true;
  showSound = false;
  showTitle = false;

  readonly loaderId = v4();

  get isMobile() {
    return window.innerWidth < 768;
  }

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly loaderService: NgxUiLoaderService,
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit(): void {}

  onGameClick() {
    this.countlyService.addEvent("gameLandingView", {
      gameID: this.game.oneplayId,
      gameGenre: this.game.genreMappings?.join(","),
      gameTitle: this.game.title,
      source: location.pathname + location.hash,
      trigger: "card",
      channel: "web",
    });
    this.router.navigate(["view", this.gLink.transform(this.game)], {
      queryParams: this.queryParams,
    });
  }

  onImgError(event) {
    event.target.src = "assets/img/default_bg.webp";
    this.showTitle = true;
  }

  playVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
    if (this.game.video && !this.isMobile && this.game.status === "live") {
      this.timer = setTimeout(() => {
        image.style.opacity = "0";
        this.showSound = true;
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("video");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          video.src =
            environment.game_assets +
            this.game.oneplayId +
            this.game.trailer_video;
          video.muted = true;
          video.play();
          // circular loader until video is loaded
          this.loaderService.startLoader(this.loaderId);
          video.onloadeddata = () => {
            this.loaderService.stopLoader(this.loaderId);
          };
        }
      }, 1000);
    }
  }

  pauseVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.game.video && !this.isMobile && this.game.status === "live") {
      image.style.opacity = "1";
      if (gameLink.firstElementChild instanceof HTMLVideoElement) {
        gameLink.removeChild(gameLink.firstElementChild);
      }
      this.showSound = false;
      this.muted = true;
      this.loaderService.stopLoader(this.loaderId);
    }
  }

  muteUnmute(e: Event, gameLink: HTMLAnchorElement, game: GameModel) {
    e.stopPropagation();
    if (game.video) {
      const video = gameLink.firstElementChild as HTMLVideoElement;
      if (video.muted) {
        video.muted = false;
        this.muted = false;
      } else {
        video.muted = true;
        this.muted = true;
      }
    }
  }
}
