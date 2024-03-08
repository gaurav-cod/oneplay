import { GameModel } from "./game.model";

export class GameFeedModel {
  readonly title: string;
  readonly games: GameModel[];
  readonly categories: string[];
  readonly type: 'hero_banner' | 'portrait_card' | 'portrait_category';
  readonly contentId: string;

  constructor(json: { [key: string]: any }) {
    this.title = json.title;
    this.games = json.results.map((game) => new GameModel(game));
    this.type = json.type;
    this.categories = json.categories;
    this.contentId = json["payload"]?.["content_ids"];
  }
}
