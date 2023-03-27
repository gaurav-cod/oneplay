import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { GameModel } from "src/app/models/game.model";

@Component({
  selector: "app-similar-games",
  templateUrl: "./similar-games.component.html",
  styleUrls: ["./similar-games.component.scss"],
})
export class SimilarGamesComponent {
  @Input() title: string;

  @Input() games: GameModel[];

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;

  constructor() {}

  // get unique games
  get _games() {
    return this.games.filter((game, index, self) => {
      return index === self.findIndex((t) => t.oneplayId === game.oneplayId);
    });
  }

  get showRightArrow() {
    const el = this.containerRef?.nativeElement;
    if (!el) return false;
    return el.scrollWidth - el.scrollLeft - el.clientWidth >= 1;
  }

  get showLeftArrow() {
    const el = this.containerRef?.nativeElement;
    if (!el) return false;
    return el.scrollLeft > 0;
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
}
