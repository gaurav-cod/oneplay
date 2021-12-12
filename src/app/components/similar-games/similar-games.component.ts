import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-similar-games",
  templateUrl: "./similar-games.component.html",
  styleUrls: ["./similar-games.component.scss"],
})
export class SimilarGamesComponent implements OnInit {
  @Input() tag: "similar" | "developer" | "genre";

  @Input() value: string;

  @ViewChild("container") containerRef: ElementRef;

  public games: GameModel[] = [];

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {
    switch (this.tag) {
      case "similar":
        this.restService
          .getSimilarGames(this.value)
          .subscribe((games) => (this.games = games));
        break;
      case "developer":
        this.restService
          .getGamesByDeveloper(this.value)
          .subscribe((games) => (this.games = games));
        break;
      case "genre":
        this.restService
          .getGamesByGenre(this.value)
          .subscribe((games) => (this.games = games));
        break;
    }
  }

  scrollRight() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(function(){
        container.scrollLeft += (container.clientWidth / 12);
        scrollAmount += (container.clientWidth / 12);
        if(scrollAmount >= (container.clientWidth / 2)){
            window.clearInterval(slideTimer);
        }
    }, 25);
  }

  scrollLeft() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(function(){
        container.scrollLeft -= (container.clientWidth / 12);
        scrollAmount += (container.clientWidth / 12);
        if(scrollAmount >= (container.clientWidth / 2)){
            window.clearInterval(slideTimer);
        }
    }, 25);
  }
}
