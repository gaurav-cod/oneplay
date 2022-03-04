import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

const queries = {
  "All Games": {},
  "Best 0f 2021": {
    release_date: "2020-12-31T18:30:00.000Z#2021-12-31T18:30:00.000Z",
  },
  "Best of 2020": {
    release_date: "2019-12-31T18:30:00.000Z#2020-12-31T18:30:00.000Z",
  },
  "Top 100": {
    rating: '4',
  },
  "Last 30 days": {
    release_date: "now-1d/d#now/d",
  },
  "Last week": {
    release_date: "now-1w/d#now/d",
  },
  "Next week": {
    release_date: "now/d#now+1w/d",
  },
};

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent implements OnInit {
  games: GameModel[] = [];
  heading: string = "All Games";

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.heading = params.filter ?? "All Games";
      this.title.setTitle("OnePlay | " + params.filter ?? "Store");
      this.loaderService.start();
      this.restService.getFilteredGames(queries[params.filter ?? "All Games"]).subscribe(
        (games) => {
          this.games = games;
          this.loaderService.stop();
        },
        (error) => {
          this.loaderService.stop();
        }
      );
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
