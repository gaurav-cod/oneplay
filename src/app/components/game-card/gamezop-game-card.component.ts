import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { GamezopModel } from "src/app/models/gamezop.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { CountlyService } from "src/app/services/countly.service";
import { getGameLandingViewSource } from "src/app/utils/countly.util";
import { environment } from "src/environments/environment";
import { v4 } from "uuid";

@Component({
  selector: "app-gamezop-game-card",
  templateUrl: "./gamezop-game-card.component.html",
  styleUrls: ["./game-card.component.scss"],
  providers: [GLinkPipe],
})
export class GamezopGameCard implements OnInit {
    @Input("game") game: GamezopModel;
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
  
    ngOnInit(): void { }
  
    onGameClick() {
      window.open(this.game.url);
    }
  
    onImgError(event) {
      event.target.src = "assets/img/default_bg.webp";
      this.showTitle = true;
    }
  
    playVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
      if (this.game.gamePreviews && !this.isMobile) {
        this.timer = setTimeout(() => {
          image.style.opacity = "0";
          this.showSound = true;
          if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
            const video = document.createElement("video");
            gameLink.insertAdjacentElement("afterbegin", video);
            video.classList.add("mask");
            video.src = this.game.gamePreviews;
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
      if (this.game.gamePreviews && !this.isMobile) {
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