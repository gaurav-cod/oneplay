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

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe
  ) {}

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
    video: HTMLVideoElement,
    image: HTMLImageElement,
    game: GameModel,
  ) {
    if (game.video) {
      image.style.opacity = "0";
      this.showSound = game.oneplayId;
      video.play();
    }
  }

  pauseVideo(
    video: HTMLVideoElement,
    image: HTMLImageElement,
    game: GameModel,
  ) {
    if (game.video) {
      image.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
      this.showSound = "";
    }
  }

  muteUnmute(e: Event, video: HTMLVideoElement, game: GameModel) {
    e.stopPropagation();
    if (game.video) {
      if (video.muted) {
        video.muted = false;
      } else {
        video.muted = true;
      }
    }
  }
}
