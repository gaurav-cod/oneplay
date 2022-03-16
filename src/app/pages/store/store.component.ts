import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { BehaviorSubject } from "rxjs";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

const queries = {
  "All Games": {},
  "Best of 2021": {
    release_date: "2020-12-31T18:30:00.000Z#2021-12-31T18:30:00.000Z",
  },
  "Best of 2020": {
    release_date: "2019-12-31T18:30:00.000Z#2020-12-31T18:30:00.000Z",
  },
  "Top 20": {
    rating: "4",
  },
  // "Last 30 days": {
  //   release_date: "now-1d/d#now/d",
  // },
  // "Last week": {
  //   release_date: "now-1w/d#now/d",
  // },
  // "Next week": {
  //   release_date: "now/d#now+1w/d",
  // },
};

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent implements OnInit {
  games: GameModel[] = [];
  heading: string = "All Games";
  isLoading: boolean = false;
  showSound = "";
  timer: NodeJS.Timeout;
  currentPage = new BehaviorSubject(0);
  canLoadMore = true;

  get routes() {
    return Object.keys(queries)
  }

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.heading = params.filter || "All Games";
      this.title.setTitle("OnePlay | " + (params.filter || "Store"));
      this.canLoadMore = true;
      this.currentPage.subscribe((page) => {
        this.loadGames(queries[params.filter || "All Games"], page);
      });
      this.currentPage.next(0);
    });
  }

  onScroll() {
    this.currentPage.next(this.currentPage.value + 1);
  }

  playVideo(video: HTMLVideoElement, image: HTMLImageElement, game: GameModel) {
    if (game.video && window.innerWidth > 768) {
      this.timer = setTimeout(() => {
        image.style.opacity = "0";
        this.showSound = game.oneplayId;
        video.muted = true;
        video.play();
      }, 1000);
    }
  }

  pauseVideo(
    video: HTMLVideoElement,
    image: HTMLImageElement,
    game: GameModel
  ) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (game.video && window.innerWidth > 768) {
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

  private loadGames(query: any, page: number) {
    if (this.isLoading || !this.canLoadMore) {
      return;
    }
    this.startLoading(page);
    this.restService.getFilteredGames(query, page).subscribe(
      (games) => {
        if (page === 0) {
          this.games = games;
        } else {
          this.games = [...this.games, ...games];
        }
        if (games.length < 12) {
          this.canLoadMore = false;
        }
        this.stopLoading(page);
      },
      (error) => {
        this.stopLoading(page);
      }
    );
  }

  private startLoading(page: number) {
    if (page === 0) {
      this.loaderService.start();
    } else {
      this.loaderService.startLoader("scroll");
    }
    this.isLoading = true;
  }

  private stopLoading(page: number) {
    if (page === 0) {
      this.loaderService.stop();
    } else {
      this.loaderService.stopLoader("scroll");
    }
    this.isLoading = false;
  }
}
