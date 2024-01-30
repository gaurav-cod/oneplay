import { Component, ElementRef, Input, ViewChild, AfterViewInit, Output, EventEmitter } from "@angular/core";
import { GameModel } from "src/app/models/game.model";
import { GamezopModel } from "src/app/models/gamezop.model";
import { CountlyService } from "src/app/services/countly.service";

@Component({
  selector: "app-similar-games",
  templateUrl: "./similar-games.component.html",
  styleUrls: ["./similar-games.component.scss"],
})
export class SimilarGamesComponent implements AfterViewInit {
  @Input() title: string;
  @Input() games: GameModel[] | GamezopModel[];
  @Input() isInstallAndPlayList: boolean = false;
  @Input() isGamezopList: boolean = false;

  @Output() gameClick = new EventEmitter<string>();

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;

  showRightArrow = false;
  showLeftArrow = false;

  constructor(
    private readonly countlyService: CountlyService
  ) { }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateArrows(), 100)
  }

  gameClicked(event: string) {
    this.gameClick.emit(event);
  }

  // get unique games
  get _games() {
    if (!this.isGamezopList) {
      return (this.games as GameModel[]).filter((game, index, self) => {
        return index === self.findIndex((t) => (t as GameModel).oneplayId === (game as GameModel).oneplayId);
      });
    } else {
      return (this.games as GamezopModel[]).filter((game, index, self) => {
        return index === self.findIndex((t) => (t as GamezopModel).code === (game as GamezopModel).code);
      });
    }
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
