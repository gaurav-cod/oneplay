import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent implements OnInit {
  games: GameModel[] = [];

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.title.setTitle("OnePlay | Store");
    this.loaderService.start();
    this.restService.getFilteredGames().subscribe((games) => {
      this.games = games;
      this.loaderService.stop();
    }, (err) => {
      this.loaderService.stop();
    });
  }

  playVideo(video: HTMLVideoElement, image: HTMLImageElement, game: GameModel) {
    if (game.video) {
      image.style.opacity = "0";
      video.play();
    }
  }

  pauseVideo(
    video: HTMLVideoElement,
    image: HTMLImageElement,
    game: GameModel
  ) {
    if (game.video) {
      image.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
    }
  }
}
