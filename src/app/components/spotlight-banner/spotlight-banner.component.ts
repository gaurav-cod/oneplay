import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GameModel } from 'src/app/models/game.model';
import { GameFeedModel } from 'src/app/models/gameFeed.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { CountlyService } from 'src/app/services/countly.service';
import { environment } from 'src/environments/environment';
import { v4 } from 'uuid';

@Component({
  selector: 'app-spotlight-banner',
  templateUrl: './spotlight-banner.component.html',
  styleUrls: ['./spotlight-banner.component.scss'],
  providers: [GLinkPipe]
})
export class SpotlightBannerComponent implements OnInit {
  
  @Input() gameFeed: GameFeedModel;
  @Output("gameClick") gameClick = new EventEmitter();
  @ViewChild("gameLink") gameLink;

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;

  public specialBannerGame: GameModel;
  public specialBannerRowGame: GameModel[] = [];

  timer: NodeJS.Timeout;
  muted = true;
  showSound = false;
  showTitle = false;
  imageLoaded = false;
  showHover: boolean = false;

  public showLeftArrow: boolean = true;
  public showRightArrow: boolean = true;

  readonly loaderId = v4();

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly loaderService: NgxUiLoaderService,
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit(): void {
    this.specialBannerGame = this.gameFeed.games[0];
    this.specialBannerRowGame = this.gameFeed.games.splice(1);
  }

  get getBackgroundImage() {
    return window.innerWidth > 475 ? this.gameFeed.backgroundImage : this.gameFeed.backgroundImageMobile;
  }
  get getBackgroundImageBlurhash() {
    return window.innerWidth > 475 ? this.gameFeed.backgroundImageBlurhash : this.gameFeed.backgroundImageMobileBlurhash;
  }
  get getContainerHeight() {
    return window.innerWidth > 475 ? '100' : '100';
  }
  get isMobile() {
    return window.innerWidth < 768;
  }

  onGameClick() {
    // this.countlyService.endEvent("gameLandingView");
    // this.countlyService.startEvent("gameLandingView", {
    //   data: { source: getGameLandingViewSource(), trigger: "card" },
    // });
    this.router.navigate(["view", this.gLink.transform(this.specialBannerGame)]);
  }

  playVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
    if (this.specialBannerGame.trailer_video && !this.isMobile && this.specialBannerGame.status === "live") {
      this.timer = setTimeout(() => {
        this.showSound = true;
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("video");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          video.src =
            environment.game_assets +
            this.specialBannerGame.oneplayId +
            this.specialBannerGame.trailer_video;
          video.muted = true;
          video.style.objectFit = 'cover';
          video.style.width = "190%";
          video.style.height = "110%";
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
    if ((this.specialBannerGame.video_hero_banner_16_9 || this.specialBannerGame.video_hero_banner_1_1 || this.specialBannerGame.trailer_video ) && !this.isMobile && this.specialBannerGame.status === "live") {
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
    if (game.trailer_video) {
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

  scrollRight() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(() => {
      scrollAmount += container.clientWidth / 12;
      container.scrollLeft += scrollAmount;
      if (scrollAmount >= container.clientWidth / 2) {
        window.clearInterval(slideTimer);
        this.updateArrows();
      }
    }, 25);
  }

  scrollLeft() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(() => {
      container.scrollLeft -= container.clientWidth / 12;
      scrollAmount += container.clientWidth / 12;
      if (scrollAmount >= container.clientWidth / 2) {
        window.clearInterval(slideTimer);
        this.updateArrows();
      }
    }, 25);
  }

  updateArrows() {
    const el = this.containerRef?.nativeElement;
    this.showRightArrow = el.scrollWidth - el.scrollLeft - el.clientWidth >= 1;
    this.showLeftArrow = el.scrollLeft > 0;
  }
}
