import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { GameFeedModel } from 'src/app/models/gameFeed.model';

@Component({
  selector: 'app-parallex-sec',
  templateUrl: './parallex-sec.component.html',
  styleUrls: ['./parallex-sec.component.scss']
})
export class ParallexSecComponent implements OnInit, AfterViewInit, OnDestroy {


  private _arrowTimeout: NodeJS.Timer;

  private lastScrollTop: number = 0;
  public marginValue: number = 1;
  @Input() gamesFeed: GameFeedModel;

  @Output() gameClick = new EventEmitter<string>();

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;

  public showRightArrow = false;
  public showLeftArrow = false;

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this._arrowTimeout = setTimeout(() => this.updateArrows(), 100);
  }
  ngOnDestroy(): void {
    clearTimeout(this._arrowTimeout);
  }

  constructor() {
  }

  get getBackgroundImage() {
    return window.innerWidth > 475 ? this.gamesFeed.backgroundImage : this.gamesFeed.backgroundImageMobile;
  }
  get getBackgroundImageBlurhash() {
    return window.innerWidth > 475 ? this.gamesFeed.backgroundImageBlurhash : this.gamesFeed.backgroundImageMobileBlurhash;
  }

  get getForegroundImage() {
    return window.innerWidth > 475 ? this.gamesFeed.foregroundImage : this.gamesFeed.foregroundImageMobile;
  }
  get getForegroundImageBlurhash() {
    return window.innerWidth > 475 ? this.gamesFeed.foregroundImageBlurhash : this.gamesFeed.foregroundImageMobileBlurhash;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    const step = window.innerWidth > 475 ?  4 : 0.5;
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if (st > this.lastScrollTop) {
      this.marginValue += (step / 500);
      if (this.marginValue > 1.5)
        this.marginValue = 1.5;
    } else {
      this.marginValue -= (step / 500);
      if (this.marginValue < 1)
        this.marginValue = 1;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }

  updateArrows() {
    const el = this.containerRef?.nativeElement;
    this.showRightArrow = el.scrollWidth - el.scrollLeft - el.clientWidth >= 1;
    this.showLeftArrow = el.scrollLeft > 0;
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
}
