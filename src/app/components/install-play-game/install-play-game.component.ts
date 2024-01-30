import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GameModel } from 'src/app/models/game.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { CountlyService } from 'src/app/services/countly.service';
import { getGameLandingViewSource } from 'src/app/utils/countly.util';

@Component({
  selector: 'app-install-play-game',
  templateUrl: './install-play-game.component.html',
  styleUrls: ['./install-play-game.component.scss'],
  providers: [GLinkPipe],
})
export class InstallPlayGameComponent {
  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input("showBottomLabel") showBottomLabel: boolean = true;
  @Input('calledFrom') calledFrom: "HOME" | "STORE_INSTALL_PLAY" | "STORE_OTHER" | "LIBRARY" = "HOME";
  @Input("isInstallAndPlayList") isInstallAndPlayList: boolean = false;

  @Output("gameClick") gameClick = new EventEmitter();
  
  get isMobile() {
    return window.innerWidth < 768;
  }

  constructor(
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly countlyService: CountlyService
  ) { }

  ngOnInit(): void {
  }

  onGameClick() {
    this.countlyService.endEvent("gameLandingView")
    this.countlyService.startEvent("gameLandingView", {
      data: { source: getGameLandingViewSource(), trigger: 'card' },
    });
    
    this.gameClick.emit(this.game.title);
    this.router.navigate(["view", this.gLink.transform(this.game)], {
      queryParams: this.queryParams,
    });
  }
  onImgError(event) {
    event.target.src = 'assets/img/store/store.svg';
  }

}
