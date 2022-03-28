import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { GameModel } from "src/app/models/game.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";

@Component({
  selector: "app-similar-games",
  templateUrl: "./similar-games.component.html",
  styleUrls: ["./similar-games.component.scss"],
  providers: [GLinkPipe],
})
export class SimilarGamesComponent {
  @Input() title: string;

  @Input() games: GameModel[];

  @ViewChild("container") containerRef: ElementRef;

  @ViewChild("mask") maskRef: ElementRef<HTMLDivElement>;

  showSound = "";
  timer: NodeJS.Timeout;
  muted = true;

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe
  ) {}

  // get unique games
  get _games() {
    return this.games.filter((game, index, self) => {
      return index === self.findIndex((t) => t.oneplayId === game.oneplayId);
    });
  }

  get isMobile() {
    return window.innerWidth < 768;
  }

  onGameClick(game: GameModel) {
    this.router.navigateByUrl("/view/" + this.gLink.transform(game));
  }

  scrollRight() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(function () {
      container.scrollLeft += container.clientWidth / 12;
      scrollAmount += container.clientWidth / 12;
      if (scrollAmount >= container.clientWidth / 2) {
        window.clearInterval(slideTimer);
      }
    }, 25);
  }

  scrollLeft() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(function () {
      container.scrollLeft -= container.clientWidth / 12;
      scrollAmount += container.clientWidth / 12;
      if (scrollAmount >= container.clientWidth / 2) {
        window.clearInterval(slideTimer);
      }
    }, 25);
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
        if (!(gameLink.firstElementChild instanceof HTMLVideoElement)) {
          const video = document.createElement("video");
          gameLink.insertAdjacentElement("afterbegin", video);
          video.classList.add("mask");
          video.src = game.video;
          video.muted = true;
          video.play();
        }
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
      this.muted = true;
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
