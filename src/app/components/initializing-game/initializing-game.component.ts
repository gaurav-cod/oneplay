import { Component } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';

@Component({
  selector: 'app-initializing-game',
  templateUrl: './initializing-game.component.html',
  styleUrls: ['./initializing-game.component.scss']
})
export class InitializingGameComponent {
  game: GameModel;
}
