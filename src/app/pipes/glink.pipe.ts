import { Pipe, PipeTransform } from "@angular/core";
import { GameModel } from "../models/game.model";

@Pipe({ name: "glink" })
export class GLinkPipe implements PipeTransform {
  transform(game: GameModel) {
    return game.title.replace(/\s/g, "-") + "-" + game.oneplayId;
  }
}
