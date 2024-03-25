import { Component, ElementRef, Input, ViewChild, AfterViewInit, Output, EventEmitter, OnInit, OnDestroy, HostListener } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FilterPayload } from "src/app/interface";
import { GameModel } from "src/app/models/game.model";
import { RAIL_TYPES } from "src/app/models/gameFeed.model";
import { GamezopModel } from "src/app/models/gamezop.model";
import { VideoModel } from "src/app/models/video.model";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
@Component({
  selector: 'app-similar-games-v2',
  templateUrl: './similar-games-v2.component.html',
  styleUrls: ['./similar-games-v2.component.scss']
})
export class SimilarGamesV2Component implements OnInit, AfterViewInit, OnDestroy {
  @Input() title: string;
  @Input() entries: (GameModel | VideoModel | GamezopModel)[] = [];
  @Input() payload: FilterPayload;
  @Input() railCategoryList: string[];
  @Input() isInstallAndPlayList: boolean = false;
  @Input() isGamezopList: boolean = false;
  @Input() isSpecialBanner: boolean = false;
  @Input() railType: RAIL_TYPES;

  @Output() gameClick = new EventEmitter<string>();

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;
  @ViewChild("scrollFilter") scrollFilter: ElementRef<HTMLDivElement>;

  showRightArrow = false;
  showLeftArrow = false;

  private _arrowTimeout: NodeJS.Timer;
  private _loaderTimeout: NodeJS.Timer;

  public isFilterApplied: boolean = false;
  public selectedFilter: string = "All";
  public isLoading: boolean = false;
  public hoveringCardId: string | null = null;
  public canMoveCard: boolean = false;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    
    // removing hovering cards
    this.hoveringCardId = null;
  }

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly restService: RestService
  ) { }

  ngOnDestroy(): void {
    clearTimeout(this._arrowTimeout);
    clearTimeout(this._loaderTimeout);
  }
  // mouseDownHandler(event) {
  //   const container = this.scrollFilter.nativeElement;
  //   const scrollAmount = event.pageX - container.scrollLeft;
  //   container.scrollLeft = (container.scrollLeft + scrollAmount) * 0.5;
  //   console.log(container.scrollLeft);
  // }
  // mouseMoveHandler() {

  // }

  ngAfterViewInit(): void {

    this._arrowTimeout = setTimeout(() => this.updateArrows(), 100);
    if (this.railCategoryList?.length > 0 && !this.railCategoryList.includes("All"))
      this.railCategoryList.splice(0, 0, "All")
  }
  ngOnInit(): void {
    this.isFilterApplied = this.activatedRoute.snapshot.params['filter'] != null;
  }

  get isMobile() {
    return window.innerWidth < 768;
  }

  get getStreamIcon() {
    return ((this.entries instanceof VideoModel) && (this.entries[0] as VideoModel).isLive) ? "assets/icons/live-icon.svg" : "assets/icons/recorded-game.gif";
  }

  gameClicked(event: string) {
    this.gameClick.emit(event);
  }
  cardHoverHandler(oneplayId: string) {
    this.hoveringCardId = oneplayId;
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
    this.restService.getFilteredGamesV2({ genres: filter == "All" ? null : filter }, this.payload, 0).subscribe((games) => {
      this.entries = games;
      this._loaderTimeout = setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
  }
}
