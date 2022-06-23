import { GameModel } from "./game.model";

export class GameSearch {
  readonly keyword: string;
  readonly keywordHash: string;
  readonly results: GameModel[];

  constructor(json: { [key: string]: any }) {
    this.keyword = json.keyword;
    this.keywordHash = json.keywordHash;
    this.results = json.results.map((x) => new GameModel(x));
  }
}
