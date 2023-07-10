import { Component, ElementRef, Input, ViewChild, AfterViewInit } from "@angular/core";
import { GameModel } from "src/app/models/game.model";

@Component({
  selector: "app-similar-games",
  templateUrl: "./similar-games.component.html",
  styleUrls: ["./similar-games.component.scss"],
})
export class SimilarGamesComponent implements AfterViewInit {
  @Input() title: string;

  @Input() games: GameModel[];

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;

  showRightArrow = false;
  showLeftArrow = false;

  constructor() {}

  ngAfterViewInit(): void {
    setTimeout(() => this.updateArrows(), 100)
  }

  // get unique games
  get _games() {
    return this.games.filter((game, index, self) => {
      return index === self.findIndex((t) => t.oneplayId === game.oneplayId);
    });
  }

  scrollRight() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(() => {
      container.scrollLeft += container.clientWidth / 12;
      scrollAmount += container.clientWidth / 12;
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
