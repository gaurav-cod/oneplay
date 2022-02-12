import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GameModel } from '../models/game.model';

@Pipe({
  name: 'gameAsset'
})
export class GameAssetPipe implements PipeTransform {

  transform(game: GameModel, ...args: any[]): string {
    return environment.game_assets + "/" + game.oneplayId + game[args[0]];
  }

}
