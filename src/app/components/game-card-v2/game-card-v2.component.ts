import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GameModel } from 'src/app/models/game.model';
import { RAIL_TYPES } from 'src/app/models/gameFeed.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { CountlyService } from 'src/app/services/countly.service';
import { getGameLandingViewSource } from 'src/app/utils/countly.util';
import { environment } from 'src/environments/environment';
import { v4 } from 'uuid';

@Component({
  selector: 'app-game-card-v2',
  templateUrl: './game-card-v2.component.html',
  styleUrls: ['./game-card-v2.component.scss'],
  providers: [GLinkPipe],
})
export class GameCardV2Component implements AfterViewInit {
  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input("hasFixedWidth") hfw: boolean = false;
  @Input("calledFrom") calledFrom:
    | "HOME"
    | "STORE_INSTALL_PLAY"
    | "STORE_OTHER"
    | "LIBRARY" = "HOME";

  @Input() railType: RAIL_TYPES;

  @Input() specialBannerGame: boolean = false;

  @Output("gameClick") gameClick = new EventEmitter();

  @ViewChild("gameLink") gameLink;
  @ViewChild("image") image;

  timer: NodeJS.Timeout;
  muted = true;
  showSound = false;
  showTitle = false;
  imageLoaded = false;
  showHover: boolean = false;

  readonly loaderId = v4();

  get isMobile() {
    return window.innerWidth < 768;
  }
  get getTrailerVideo() {
    return environment.game_assets + this.game.oneplayId;
  }
  get getVideo() {
    return window.innerWidth > 475 ? (this.game.video_hero_banner_16_9 ?? (this.getTrailerVideo + this.game.trailer_video)) : (this.game.video_hero_banner_1_1 ?? (this.getTrailerVideo + this.game.trailer_video));
  }

  ngAfterViewInit(): void {
  }

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly loaderService: NgxUiLoaderService,
    private readonly countlyService: CountlyService
  ) {
  }

  onGameClick() {
    this.countlyService.endEvent("gameLandingView");
    this.countlyService.startEvent("gameLandingView", {
      data: { source: getGameLandingViewSource(), trigger: "card" },
    });
    this.gameClick.emit(this.game.title);
    this.router.navigate(["view", this.gLink.transform(this.game)], {
      queryParams: this.queryParams,
    });
  }

  onImgError(event) {
    event.target.src = "assets/img/default_bg.webp";
    this.showTitle = true;
  }
  mouseEnterHandler() {
    this.showHover = !this.isMobile && !this.game.trailer_video;
  }

  
  playVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
    if (this.game.trailer_video && !this.isMobile && this.game.status === "live") {
      this.timer = setTimeout(() => {
        this.showSound = true;
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("video");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          video.src = this.getVideo;
          video.muted = true;
          video.style.objectFit = 'cover';
          video.style.width = "120%";
          video.style.height = "120%";
          video.style.zIndex = "100000";
          video.style.border = "2px solid transparent";
          video.style.backgroundImage = "linear-gradient(to bottom right, #FF0CF5, #fc77f8, #0575E6, #0575E6, #0575E6)";
          video.style.backgroundOrigin = "border-box";

          if (video.getBoundingClientRect().right > window.innerWidth) {
            video.style.left = String(Number(video.style.left) - 250) + "px";
          }

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
    if ((this.game.video_hero_banner_16_9 || this.game.video_hero_banner_1_1 || this.game.trailer_video ) && !this.isMobile && this.game.status === "live") {
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
