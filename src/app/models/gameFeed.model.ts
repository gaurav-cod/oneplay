import { GameModel } from "./game.model";

type RAIL_TYPES = 'hero_banner' 
  | 'portrait_card' 
  | 'portrait_category' 
  | "square_category_small" 
  | "square_category_large" 
  | "spotlight_banner" 
  | "landscape_video" 
  | "special_banner";

export class GameFeedModel {
  readonly title: string;
  readonly games: GameModel[];
  readonly categories: string[];
  readonly type: RAIL_TYPES;
  readonly contentId: string;
  readonly backgroundImage: string;
  readonly backgroundImageBlurhash: string;
  readonly backgroundImageMobile: string;
  readonly backgroundImageMobileBlurhash: string;
  readonly foregroundImage: string;
  readonly foregroundImageBlurhash: string;
  readonly foregroundImageMobile: string;
  readonly foregroundImageMobileBlurhash: string;

  constructor(json: { [key: string]: any }) {
    this.title = json.title;
    this.games = json.results.map((game) => new GameModel(game));
    this.type = json.type;
    this.categories = json.categories;
    this.contentId = json["payload"]?.["content_ids"];
    this.backgroundImage = json["background_image"];
    this.backgroundImageBlurhash = json["background_image_blurhash"];
    this.backgroundImageMobile = json["background_image_mobile"];
    this.backgroundImageMobileBlurhash = json["background_image_mobile_blurhash"];
    this.foregroundImage = json["foreground_image"];
    this.foregroundImageBlurhash = json["foreground_image_blurhash"];
    this.foregroundImageMobile = json["foreground_image_mobile"];
    this.foregroundImageMobileBlurhash = json["foreground_image_mobile_blurhash"];
  }
}
