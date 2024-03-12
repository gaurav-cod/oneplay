import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GameFeedModel } from 'src/app/models/gameFeed.model';

@Component({
  selector: 'app-parallex-sec',
  templateUrl: './parallex-sec.component.html',
  styleUrls: ['./parallex-sec.component.scss']
})
export class ParallexSecComponent implements OnInit {

  private lastScrollTop: number = 0;
  public marginValue: number = 1;
  @Input() gamesFeed: GameFeedModel;

  @Output() gameClick = new EventEmitter<string>();

  @ViewChild("container") containerRef: ElementRef<HTMLDivElement>;

  showRightArrow = false;
  showLeftArrow = false;

  ngOnInit(): void {
    console.log(this.gamesFeed);
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
      const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      this.marginValue += 4;
    } else {
      this.marginValue -= 4;
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
