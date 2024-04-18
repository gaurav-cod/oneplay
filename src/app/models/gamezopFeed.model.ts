import { FilterPayload } from "../interface";
import { GamezopModel } from "./gamezop.model";

export class GamezopFeedModel {
  readonly title: string;
  readonly games: GamezopModel[];
  readonly categories: string[];
  readonly filterPayload: FilterPayload;
  readonly type: 'header' | 'rail';
  readonly limit: number;

  constructor(json: { [key: string]: any }) {
    this.title = json["title"];
    this.categories = json["categories"];
    this.games = json.results.map((game) => new GamezopModel(game));
    this.type = json["type"];
    this.filterPayload = json["payload"];
    this.limit = json["limit"];
  }
}
