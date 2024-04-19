import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Subscription } from "rxjs";
import { AaaFilterCollection, AaaFiltersRO } from "src/app/interface";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent implements OnInit, OnDestroy {
  games: GameModel[] = [];
  currentPage = 0;
  pagelimit = 24;
  isLoading = false;
  canLoadMore = true;
  isInstallPlayList: boolean = false;
  filters: AaaFiltersRO[] = [];
  selectedFilter: AaaFilterCollection = null;

  get isMobile() {
    return window.innerWidth < 768;
  }

  get collections() {
    return this.filters.reduce<AaaFilterCollection[]>(
      (a, b) => [...a, ...b.collections],
      []
    );
  }

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    try {
      this.startLoading(0);
      this.filters = await this.restService.getAaaFilters().toPromise();
      this.selectedFilter = this.filters?.[0]?.collections?.[0];
      await this.loadFirst();
      this.stopLoading(0);
    } catch (e) {
      this.stopLoading(0);
      if (e.timeout) {
        this.router.navigateByUrl("/server-error");
      }
    }
  }

  ngOnDestroy(): void {
    this.reset();
    this.filters = [];
    this.selectedFilter = null;
  }

  onSelectFilter(filter: AaaFilterCollection) {
    this.selectedFilter = filter;
    this.reset();
    this.loadFirst();
  }

  onScroll() {
    this.loadMore();
  }

  private async loadFirst() {
    this.games = await this.restService
      .getFilteredGames(this.selectedFilter.payload, 0, this.pagelimit)
      .toPromise();
    this.isInstallPlayList = this.games.every((game) => game.isInstallAndPlay);
    if (this.games.length < this.pagelimit) {
      this.canLoadMore = false;
    }
  }

  private loadMore() {
    if (this.isLoading || !this.canLoadMore) {
      return;
    }
    this.startLoading(this.currentPage + 1);
    this.restService
      .getFilteredGames(
        this.selectedFilter.payload,
        this.currentPage + 1,
        this.pagelimit
      )
      .toPromise()
      .then((games) => {
        this.games = [...this.games, ...games];
        this.isInstallPlayList = this.games.every(
          (game) => game.isInstallAndPlay
        );
        if (games.length < this.pagelimit) {
          this.canLoadMore = false;
        }
        this.stopLoading(this.currentPage + 1);
        this.currentPage++;
      })
      .catch((error) => {
        this.stopLoading(this.currentPage + 1);
      });
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

  private reset() {
    this.games = [];
    this.currentPage = 0;
    this.isLoading = false;
    this.canLoadMore = true;
    this.isInstallPlayList = false;
  }
}
