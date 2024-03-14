import { GamezopModel } from "./gamezop.model";

export class GamezopFeedModel {
  readonly title: string;
  readonly games: GamezopModel[];
  readonly categories: string[];
  readonly type: 'header' | 'rail';

  constructor(json: { [key: string]: any }) {
    this.title = json.title;
    this.categories = json["categories"];
    this.games = json.results.map((game) => new GamezopModel(game));
    this.type = json.type;
  }
}
