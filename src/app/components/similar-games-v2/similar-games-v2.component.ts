import { Component, ElementRef, Input, ViewChild, AfterViewInit, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GameModel } from "src/app/models/game.model";
import { GamezopModel } from "src/app/models/gamezop.model";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
@Component({
  selector: 'app-similar-games-v2',
  templateUrl: './similar-games-v2.component.html',
  styleUrls: ['./similar-games-v2.component.scss']
})
export class SimilarGamesV2Component implements OnInit, AfterViewInit, OnDestroy  {
  @Input() title: string;
  @Input() contentId: string;
  @Input() games: GameModel[] | GamezopModel[];
  @Input() railCategoryList: string[];
  @Input() isInstallAndPlayList: boolean = false;
  @Input() isGamezopList: boolean = false;
  @Input() isSpecialBanner: boolean = false;

  @Output() gameClick = new EventEmitter<string>();

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;

  showRightArrow = false;
  showLeftArrow = false;

  private _arrowTimeout: NodeJS.Timer;
  private _loaderTimeout: NodeJS.Timer;

  public isFilterApplied: boolean = false;
  public selectedFilter: string = "All";
  public isLoading: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly countlyService: CountlyService,
    private readonly restService: RestService
  ) { }

  ngOnDestroy(): void {
    clearTimeout(this._arrowTimeout);
    clearTimeout(this._loaderTimeout);
  }

  ngAfterViewInit(): void {

    this._arrowTimeout = setTimeout(() => this.updateArrows(), 100);
    if (this.railCategoryList?.length > 0 && !this.railCategoryList.includes("All"))
      this.railCategoryList.splice(0, 0, "All")
  }
  ngOnInit(): void {
    this.isFilterApplied  = this.activatedRoute.snapshot.params['filter'] != null;
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

  selectFilter(filter: string) {

    if (filter == this.selectedFilter)
      return;

    this.selectedFilter = filter;
    this.isLoading = true;
    this.restService.getFilteredGamesV2({genres: filter == "All" ? null : filter}, this.contentId,0).subscribe((games) => {
      this.games = games;
      this._loaderTimeout = setTimeout(()=> {
        this.isLoading = false;
      }, 500);
    });
  }
}
