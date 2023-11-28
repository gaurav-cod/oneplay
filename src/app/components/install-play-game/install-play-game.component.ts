import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GameModel } from 'src/app/models/game.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { CountlyService } from 'src/app/services/countly.service';
import { getGameLandingViewSource } from 'src/app/utils/countly.util';
import { environment } from 'src/environments/environment';
import { v4 } from 'uuid';

@Component({
  selector: 'app-install-play-game',
  templateUrl: './install-play-game.component.html',
  styleUrls: ['./install-play-game.component.scss'],
  providers: [GLinkPipe],
})
export class InstallPlayGameComponent {
  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input("hasFixedWidth") hfw: boolean = false;
  @Input('calledFrom') calledFrom: "HOME" | "STORE_INSTALL_PLAY" | "STORE_OTHER" = "HOME";

  timer: NodeJS.Timeout;
  muted = true;
  showSound = false;
  showTitle = false;

  readonly loaderId = v4();

  get isMobile() {
    return window.innerWidth < 768;
  }

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly loaderService: NgxUiLoaderService,
    private readonly countlyService: CountlyService
  ) { }

  ngOnInit(): void {
  }

  onGameClick() {
    this.countlyService.endEvent("gameLandingView")
    this.countlyService.startEvent("gameLandingView", {
      data: { source: getGameLandingViewSource(), trigger: 'card' },
    });
    this.router.navigate(["view", this.gLink.transform(this.game)], {
      queryParams: this.queryParams,
    });
  }

}
