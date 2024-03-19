import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class CategorySmallRailComponent implements OnInit, AfterViewInit, OnDestroy {


  constructor(
    private readonly restService: RestService
  ) { }

  @Input() gameFeed: GamezopFeedModel;
  @Input() contentId: string;
  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;
  
  public gamesListBatches = {};


  public isFilterApplied: boolean = false;
  public selectedFilter: string = "All";
  public isLoading: boolean = false;

  public showRightArrow = false;
  public showLeftArrow = false;

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

  ngAfterViewInit(): void {
    this._arrowTimeout = setTimeout(() => this.updateArrows(), 100);
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

  getObjectKeys() {
    return Object.keys(this.gamesListBatches);
  }
  selectFilter(filter: string) {
    if (filter == this.selectedFilter)
      return;

    this.selectedFilter = filter;
    this.isLoading = true;
    this.restService.getFilteredCasualGamesV2(this.selectedFilter == "All" ? null : this.selectedFilter, 0).subscribe((games) => {
      this.rearrangeGameBatch(games);
      this._loaderTimeout = setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
  }
}
