import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GamezopModel } from 'src/app/models/gamezop.model';
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

  public showHover: boolean = false;

  @Input("hoveringCardId") hoveringCardId: string | null = null;
  @Output("onMouseHoverCard") onMouseHoverCard = new EventEmitter<string>();
  @ViewChild("hoverImage") hoverImage;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly loaderService: NgxUiLoaderService
  ) {}

  readonly loaderId = v4();

  get isMobile() {
    return window.innerWidth < 1200;
  }

  ngOnInit(): void {
  } 
  ngOnChanges(changes: SimpleChanges): void {
    if (this.game.code != this.hoveringCardId) {
      this.showHover = false;
    }
  }

  playVideo(gameLink: HTMLAnchorElement, image: HTMLImageElement) {
    if (this.game.gamePreviews && !this.isMobile) {
      this.timer = setTimeout(() => {
        this.showSound = true;
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("iframe");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          // video.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.game.gamePreviews).toString();
          video.src = `https://www.youtube.com/embed/${this.game.gamePreviews.split("/").at(-1)}?autoplay=1`;

          video.style.objectFit = 'cover';
          video.style.width = "100%";
          video.style.height = "150%";
          video.style.zIndex = "100000";
          video.style.border = "2px solid transparent";
          video.style.backgroundImage = "linear-gradient(to bottom right, #FF0CF5, #fc77f8, #0575E6, #0575E6, #0575E6)";
          video.style.backgroundOrigin = "border-box";
          video.setAttribute("allow", "autoplay; encrypted-media");
          video.setAttribute("frameborder", "0");
          video.setAttribute("allowfullscreen", "");

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
      if (gameLink.firstElementChild instanceof HTMLIFrameElement) {
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

  mouseEnterHandler() {
    this.onMouseHoverCard.emit(this.game.code);
    setTimeout(()=> {
      this.showHover = !this.isMobile && !this.game.gamePreviews && (this.hoveringCardId == this.game.code);
      if (this.showHover) {
        this.onMouseHoverCard.emit(this.game.code);
        
          if (this.hoverImage.nativeElement.getBoundingClientRect().left < 0) {
            this.hoverImage.nativeElement.style.left = String(Number(this.hoverImage.nativeElement.style.left) + 100) + "px";
          }
      }
    }, 100)
  }
  mouseLeaveHandler() {
    if (this.hoveringCardId == this.game.code) {
      this.showHover = false;
      this.onMouseHoverCard.emit(null);
    }
  }
}
