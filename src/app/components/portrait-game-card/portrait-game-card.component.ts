import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  selector: 'app-portrait-game-card',
  templateUrl: './portrait-game-card.component.html',
  styleUrls: ['./portrait-game-card.component.scss'],
  providers: [GLinkPipe],
})
export class PortraitGameCardComponent implements OnInit {
  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input() railType: RAIL_TYPES;

  @Output("gameClick") gameClick = new EventEmitter();
  @Input("hoveringCardId") hoveringCardId: string | null = null;
  @Output("onMouseHoverCard") onMouseHoverCard = new EventEmitter<string>();

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

  get isMobileTab() {
    return window.innerWidth < 1200;
  }

  get getTrailerVideo() {
    return environment.game_assets + this.game.oneplayId;
  }
  get getVideo() {
    return window.innerWidth > 475 ? (this.game.video_hero_banner_16_9 ) : (this.game.video_hero_banner_1_1 );
  }
  get getVideoHeight() {
    return window.innerWidth > 1280 ? "90%" : "60%";
  }

  ngOnInit(): void {
    
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
    
    debugger;
    if (this.getVideo && !this.isMobileTab) {
      this.timer = setTimeout(() => {
        this.showSound = true;
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("video");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          video.src = this.getVideo;
          video.muted = true;
          video.style.objectFit = 'cover';
          video.style.width = this.railType == "square_category_large" ? "180%" : "200%";
          video.style.height = this.getVideoHeight;
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
    if (this.getVideo && !this.isMobileTab) {
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
    if (this.getVideo) {
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
    this.onMouseHoverCard.emit(this.game.oneplayId);
    debugger;
    setTimeout(()=> {
      this.showHover = !this.isMobileTab && !this.getVideo && (this.hoveringCardId == this.game.oneplayId);
      if (this.showHover) {
        this.onMouseHoverCard.emit(this.game.oneplayId);
        
        setTimeout(()=> {
          if (this.hoverImage.nativeElement.getBoundingClientRect().left < 0) {
            this.hoverImage.nativeElement.style.left = String(Number(this.hoverImage.nativeElement.style.left) + 150) + "px";
          } 
          if (this.hoverImage.nativeElement.getBoundingClientRect().right > window.innerWidth) {
            this.hoverImage.nativeElement.style.left = String(Number(this.hoverImage.nativeElement.style.left) - 200) + "px";
          }
        }, 50)
          
      }
    }, 100)
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
