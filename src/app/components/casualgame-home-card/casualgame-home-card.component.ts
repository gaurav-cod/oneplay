import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';
import { GamezopModel } from 'src/app/models/gamezop.model';

@Component({
  selector: 'app-casualgame-home-card',
  templateUrl: './casualgame-home-card.component.html',
  styleUrls: ['./casualgame-home-card.component.scss']
})
export class CasualgameHomeCardComponent {

  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input("hasFixedWidth") hfw: boolean = false;
  
  @Output("gameClick") gameClick = new EventEmitter();
}
