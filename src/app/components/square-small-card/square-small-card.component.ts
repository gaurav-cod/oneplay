import { Component, Input, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GameModel } from 'src/app/models/game.model';
import { GamezopModel } from 'src/app/models/gamezop.model';
import { environment } from 'src/environments/environment';
import { v4 } from 'uuid';

@Component({
  selector: 'app-square-small-card',
  templateUrl: './square-small-card.component.html',
  styleUrls: ['./square-small-card.component.scss']
})
export class SquareSmallCardComponent implements OnInit {

  @Input() game:GamezopModel;

  timer: NodeJS.Timeout;
  muted = true;
  showSound = false;
  showTitle = false;
  imageLoaded = false;

  constructor(
    private readonly loaderService: NgxUiLoaderService
  ) {}

  readonly loaderId = v4();

  get isMobile() {
    return window.innerWidth < 768;
  }

  ngOnInit(): void {
    console.log(this.game);
  }

  playVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
    if (this.game.gamePreviews && !this.isMobile) {
      this.timer = setTimeout(() => {
        this.showSound = true;
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("video");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          video.src = this.game.gamePreviews;
          
          video.style.objectFit = 'cover';
          video.style.width = "100%";
          video.style.height = "150%";
          video.style.zIndex = "100000";
          video.style.border = "2px solid transparent";
          video.style.backgroundImage = "linear-gradient(to bottom right, #FF0CF5, #fc77f8, #0575E6, #0575E6, #0575E6)";
          video.style.backgroundOrigin = "border-box";

          if (video.getBoundingClientRect().right > window.innerWidth) {
            video.style.left = String(Number(video.style.left) - 250) + "px";
          }

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

  muteUnmute(e: Event, gameLink: HTMLAnchorElement, game: GamezopModel) {
    e.stopPropagation();
    if (game.gamePreviews) {
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

  gamezopGame() {
    window.open(this.game.url);
  }
}
