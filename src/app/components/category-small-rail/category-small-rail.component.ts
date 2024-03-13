import { Component, Input, OnInit } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';
import { GameFeedModel } from 'src/app/models/gameFeed.model';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-category-small-rail',
  templateUrl: './category-small-rail.component.html',
  styleUrls: ['./category-small-rail.component.scss']
})
export class CategorySmallRailComponent implements OnInit {


  constructor(
    private readonly restService: RestService
  ) { }

  @Input() gameFeed: GameFeedModel;
  @Input() contentId: string;
  public gamesListBatches = {};


  public isFilterApplied: boolean = false;
  public selectedFilter: string = "All";
  public isLoading: boolean = false;

  private _arrowTimeout: NodeJS.Timer;
  private _loaderTimeout: NodeJS.Timer;


  ngOnInit() {
    this.rearrangeGameBatch(this.gameFeed.games);
  }

  rearrangeGameBatch(games: GameModel[]) {
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
    this.restService.getFilteredGamesV2({ genres: filter == "All" ? null : filter }, this.contentId, 0).subscribe((games) => {
      this.rearrangeGameBatch(games);
      this._loaderTimeout = setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
  }
}
