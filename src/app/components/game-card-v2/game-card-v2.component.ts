import { AfterViewInit, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  @Input("hoveringCardId") hoveringCardId: string | null = null;
  @Output("onMouseHoverCard") onMouseHoverCard = new EventEmitter<string>();

  @Input() specialBannerGame: boolean = false;

  @Output("gameClick") gameClick = new EventEmitter();

  @ViewChild("gameLink") gameLink;
  @ViewChild("image") image;
  @ViewChild("hoverImage") hoverImage;

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
    return window.innerWidth > 475 ? (this.game.video_hero_banner_16_9 ) : (this.game.video_hero_banner_1_1 );
  }
  get gameBlurHash() {
    return JSON.parse(this.game.poster_16_9_blurhash)?.blurhash;
  }

  ngAfterViewInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.game.oneplayId != this.hoveringCardId) {
      this.showHover = false;
    }
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

  playVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
    if (this.getVideo && !this.isMobile) {
      this.timer = setTimeout(() => {
        this.showSound = true;
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("video");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          video.src = this.getVideo;
          video.muted = true;
          video.style.objectFit = 'cover';
          video.style.width = "200%";
          video.style.height = "100%";
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
    if (this.getVideo && !this.isMobile) {
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

  mouseEnterHandler() {
    // if (!this.getVideo) {
    //   this.onMouseHoverCard.emit(this.game.oneplayId);
    //   setTimeout(()=> {
    //     this.showHover = !this.isMobile && !this.game.trailer_video && (this.hoveringCardId == this.game.oneplayId);
    //     if (this.showHover) {
    //       this.onMouseHoverCard.emit(this.game.oneplayId);
          
    //       setTimeout(()=> {
    //         if (this.hoverImage.nativeElement.getBoundingClientRect().left < 0) {
    //           this.hoverImage.nativeElement.style.left = String(Number(this.hoverImage.nativeElement.style.left) + 150) + "px";
    //         } 
    //         if (this.hoverImage.nativeElement.getBoundingClientRect().right > window.innerWidth) {
    //           this.hoverImage.nativeElement.style.left = String(Number(this.hoverImage.nativeElement.style.left) - 200) + "px";
    //         }
    //       }, 50)
            
    //     }
    //   }, 100)
    // }
  }
  mouseLeaveHandler() {
    if (this.hoveringCardId == this.game.oneplayId) {
      this.showHover = false;
      this.onMouseHoverCard.emit(null);
    }
  }

 
  get streamCount() {
    if (this.game.streaming >= 1000000)
      return (this.formatNumberWithOneDecimal(this.game.streaming / 1000000) + "M") 
    else if (this.game.streaming >= 1000)
      return (this.formatNumberWithOneDecimal(this.game.streaming / 1000) + "k")
    return this.game.streaming;
  }
  get playersCount() {
    if (this.game.playing >= 1000000)
      return (this.formatNumberWithOneDecimal(this.game.playing / 1000000) + "M");
    else if (this.game.playing >= 1000)
      return (this.formatNumberWithOneDecimal(this.game.playing / 1000) + "k");
    return this.game.playing;
  }
  formatNumberWithOneDecimal(num) {
    const number = String(num).split('.');
    return number.length > 1 ? String(num).split('.')[0] + "." + String(num).split('.')[1][0] : num;
  }

}
