import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GameModel } from 'src/app/models/game.model';
import { RAIL_TYPES } from 'src/app/models/gameFeed.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { CountlyService } from 'src/app/services/countly.service';
import { getGameLandingViewSource } from 'src/app/utils/countly.util';
import { v4 } from 'uuid';

@Component({
  selector: 'app-install-play-game-v2',
  templateUrl: './install-play-game-v2.component.html',
  styleUrls: ['./install-play-game-v2.component.scss'],
  providers: [GLinkPipe],
})
export class InstallPlayGameV2Component implements OnInit {
  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input("hasFixedWidth") hfw: boolean = false;
  @Input("calledFrom") calledFrom:
    | "HOME"
    | "STORE_INSTALL_PLAY"
    | "STORE_OTHER"
    | "LIBRARY" = "HOME";

  @Input() specialBannerGame: boolean = false;

  @Output("gameClick") gameClick = new EventEmitter();

  @ViewChild("gameLink") gameLink;
  @ViewChild("image") image;
  @Input() railType: RAIL_TYPES;

  timer: NodeJS.Timeout;
  muted = true;
  showSound = false;
  showTitle = false;
  imageLoaded = false;

  readonly loaderId = v4();

  get isMobile() {
    return window.innerWidth < 768;
  }

  ngOnInit(): void {
  }

  get installPlayImage() {
    return window.innerWidth > 475 ? this.game.poster_16_9 : this.game.poster_1_1;
  } 
  get installPlayBlurhashImage() {
    return window.innerWidth > 475 ? this.game.poster_16_9_blurhash : this.game.poster_1_1_blurhash;
  }

  ngAfterViewInit(): void {
  }

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly loaderService: NgxUiLoaderService,
    private readonly countlyService: CountlyService
  ) {
  }

  onGameClick() {
    this.countlyService.endEvent("gameLandingView");
    this.countlyService.startEvent("gameLandingView", {
      data: { source: getGameLandingViewSource(), trigger: "card" },
    });
    this.gameClick.emit(this.game.title);
    this.router.navigate(["view", this.gLink.transform(this.game)], {
      queryParams: this.queryParams,
    });
  }

  onImgError(event) {
    event.target.src = "assets/img/default_bg.webp";
    this.showTitle = true;
  }

  
  get streamCount() {
    if (this.game.streaming >= 1000000)
      return (this.formatNumberWithOneDecimal(this.game.streaming / 1000000) + "M") 
    else if (this.game.streaming >= 1000)
      return (this.formatNumberWithOneDecimal(this.game.streaming / 1000) + "k")
    return this.game.streaming;
  }
  get playersCount() {
    if (this.game.playing >= 1000000)
      return (this.formatNumberWithOneDecimal(this.game.playing / 1000000) + "M");
    else if (this.game.playing > 1000)
      return (this.formatNumberWithOneDecimal(this.game.playing / 1000) + "k");
  }
  formatNumberWithOneDecimal(num) {
    const number = String(num).split('.');
    return number.length > 1 ? String(num).split('.')[0] + "." + String(num).split('.')[1][0] : num;
  }

}
