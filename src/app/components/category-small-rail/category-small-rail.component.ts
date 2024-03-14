import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';
import { GameFeedModel } from 'src/app/models/gameFeed.model';
import { GamezopModel } from 'src/app/models/gamezop.model';
import { GamezopFeedModel } from 'src/app/models/gamezopFeed.model';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-category-small-rail',
  templateUrl: './category-small-rail.component.html',
  styleUrls: ['./category-small-rail.component.scss']
})
export class CategorySmallRailComponent implements OnInit, OnDestroy {


  constructor(
    private readonly restService: RestService
  ) { }

  @Input() gameFeed: GamezopFeedModel;
  @Input() contentId: string;
  public gamesListBatches = {};


  public isFilterApplied: boolean = false;
  public selectedFilter: string = "All";
  public isLoading: boolean = false;

  private _arrowTimeout: NodeJS.Timer;
  private _loaderTimeout: NodeJS.Timer;

  ngOnDestroy(): void {
    clearInterval(this._arrowTimeout);
    clearInterval(this._loaderTimeout);
  }

  ngOnInit() {
    this.rearrangeGameBatch(this.gameFeed.games);
    if (!this.gameFeed.categories.includes("All"))
      this.gameFeed.categories.splice(0, 0, "All");
  }

  rearrangeGameBatch(games: GamezopModel[]) {
    this.gamesListBatches = {};
    let key: number = -1;
    for (let i = 0; i < games.length; i++) {
      if (i % 4 == 0) {
        key++;
        this.gamesListBatches[key] = [];
      }

      this.gamesListBatches[key].push(games[i]);
    }
  }
  getObjectKeys() {
    return Object.keys(this.gamesListBatches);
  }
  selectFilter(filter: string) {

    if (filter == this.selectedFilter)
      return;

    this.selectedFilter = filter;
    this.isLoading = true;
    this.restService.getFilteredCasualGamesV2({ genres: filter == "All" ? null : filter }, this.contentId, 0).subscribe((games) => {
      this.rearrangeGameBatch(games);
      this._loaderTimeout = setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
  }
}
