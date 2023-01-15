import { Component, EventEmitter, Input, Output } from "@angular/core";
import { GameModel } from "src/app/models/game.model";

@Component({
  selector: "app-select-game-card",
  templateUrl: "./select-game-card.component.html",
  styleUrls: ["./select-game-card.component.scss"],
})
export class SelectGameCardComponent {
  @Input("game") game: GameModel;
  @Input("isChecked") isChecked: boolean;
  @Output("selectClick") selectGameEvent = new EventEmitter(); 

  showTitle = false;

  onImgError(event) {
    event.target.src = 'assets/img/default_bg.jpg';
    this.showTitle = true;
  }

  onclick() {
    this.selectGameEvent.emit()
  }

}
