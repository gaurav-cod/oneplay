import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent implements OnInit {
  games: GameModel[] = [];
  heading: string = "All Games";
  currentPage = 0;
  pagelimit = 24;
  isLoading = false;
  canLoadMore = true;
  genreSelected: string = "";

  private queries = {
    // "All Games": {
    //   label: "common",
    //   value: {},
    // },
    "Best of 2022": {
      label: "common",
      value: {
        release_date: "2021-12-31T18:30:00.000Z#2022-12-31T18:30:00.000Z",
      },
    },
    "Best of 2021": {
      label: "common",
      value: {
        release_date: "2020-12-31T18:30:00.000Z#2021-12-31T18:30:00.000Z",
      },
    },

    // "Top 20": {
    //   label: "common",
    //   value: {
    //     play_time: "10",
    //     order_by: "play_time:desc",
    //   },
    // },
    "Free Games": {
      label: "common",
      value: {
        is_free: "true",
      },
    },
    // Steam: {
    //   label: "store",
    //   value: {
    //     stores: "Steam",
    //   },
    // },
    // "Epic Games": {
    //   label: "store",
    //   value: {
    //     stores: "Epic Games",
    //   },
    // },
  };

  get routes() {
    return Object.keys(this.queries);
  }

  get commonRoutes() {
    return this.filterRoutesByLabel("common");
  }

  get storeRoutes() {
    return this.filterRoutesByLabel("store");
  }

  get genreRoutes() {
    return this.filterRoutesByLabel("genre");
  }

  get developerRoutes() {
    return this.filterRoutesByLabel("developer");
  }

  get publisherRoutes() {
    return this.filterRoutesByLabel("publisher");
  }

  get isMobile() {
    return window.innerWidth < 768;
  }

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => {
        this.heading = params.filter || "All Games";
        const query = params.filter;
        if (!query) {
          this.genreSelected = "";
        } else {
          this.genreSelected = query;
        }
        this.title.setTitle("OnePlay | " + (params.filter || "Store"));
        this.canLoadMore = true;
        this.currentPage = 0;
        this.loadGames();
      },
    });

    this.restService.getTopGenres(3).subscribe((genres) => {
      genres.forEach((genre) => {
        this.queries[genre] = {
          label: "genre",
          value: {
            genres: genre,
          },
        };
      });
    });
    this.restService.getTopDevelopers(3).subscribe((developers) => {
      developers.forEach((developer) => {
        this.queries[developer] = {
          label: "developer",
          value: {
            developer: developer,
          },
        };
      });
    });
    this.restService.getTopPublishers(3).subscribe((publishers) => {
      publishers.forEach((publisher) => {
        this.queries[publisher] = {
          label: "publisher",
          value: {
            publisher: publisher,
          },
        };
      });
    });
    this.restService.getGameStores().subscribe((stores) => {
      stores.forEach((store) => {
        this.queries[store.name] = {
          label: "store",
          value: { stores: store.name },
        };
      });
    });
  }

  onScroll() {
    this.loadMore();
  }

  private filterRoutesByLabel(label: string) {
    return Object.keys(this.queries).filter(
      (route) => this.queries[route].label === label
    );
  }

  private async loadGames() {
    this.startLoading(0);
    const query = this.queries[this.heading];
    if (!query) {
      // wait for the rest service to load the genres, developers, publishers
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    this.restService
      .getFilteredGames(this.queries[this.heading]?.value, 0, this.pagelimit)
      .subscribe(
        (games) => {
          this.games = games;

          if (games.length < this.pagelimit) {
            this.canLoadMore = false;
          }
          this.shouldShowInstallPlayTag();
          this.stopLoading(0);
        },
        (error) => {
          this.stopLoading(0);
          if (error.timeout) {
            this.router.navigateByUrl("/server-error");
          }
        }
      );
  }

  private shouldShowInstallPlayTag() {
    let payload = {
      "install_and_play": "true"
    }
    this.restService.getFilteredGames(payload, 0, 5).subscribe((res) => {

      if (res.length >= 1) {
        this.queries["Install & Play"] = {
          "install_and_play": "true"
        }
      }
    }, (error: any) => {

    })
  }

  private loadMore() {
    if (this.isLoading || !this.canLoadMore) {
      return;
    }
    this.startLoading(this.currentPage + 1);
    this.restService
      .getFilteredGames(
        this.queries[this.heading]?.value,
        this.currentPage + 1,
        this.pagelimit
      )
      .subscribe(
        (games) => {
          this.games = [...this.games, ...games];
          if (games.length < this.pagelimit) {
            this.canLoadMore = false;
          }
          if (this.heading === "Top 20" && this.games.length > 20) {
            this.games = this.games.slice(0, 20);
            this.canLoadMore = false;
          }
          this.stopLoading(this.currentPage + 1);
          this.currentPage++;
        },
        (error) => {
          this.stopLoading(this.currentPage + 1);
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
