import { Component, Input, OnInit } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';
import { GameFeedModel } from 'src/app/models/gameFeed.model';

@Component({
  selector: 'app-spotlight-banner',
  templateUrl: './spotlight-banner.component.html',
  styleUrls: ['./spotlight-banner.component.scss']
})
export class SpotlightBannerComponent implements OnInit {
  @Input() gameFeed: GameFeedModel;

  public specialBannerGame: GameModel;
  public specialBannerRowGame: GameModel[] = [];

  ngOnInit(): void {
    this.specialBannerGame = this.gameFeed.games[0];
    this.specialBannerRowGame = this.gameFeed.games.splice(1);
  }

  get getBackgroundImage() {
    return window.innerWidth > 475 ? this.gameFeed.backgroundImage : this.gameFeed.backgroundImageMobile;
  }
  get getBackgroundImageBlurhash() {
    return window.innerWidth > 475 ? this.gameFeed.backgroundImageBlurhash : this.gameFeed.backgroundImageMobileBlurhash;
  }
}
