import { PurchaseStore } from "../interface";

export interface ImageHash {
  blurhash: string;
  max_height: number;
  max_width: number;
}

export enum status {
  LIVE = "live",
  NOT_OPTIMIZED = "not_optimized",
  COMING_SOON = "coming_soon",
  MAINTENANCE = "maintenance",
  UPDATING = "updating",
}
export class GameModel {

  readonly id: number;
  readonly oneplayId: string;
  readonly title: string;
  readonly description: string; // NA
  readonly playTime: number; // NA
  readonly releaseDate: Date;
  readonly posterImg: string;
  readonly bgImage: string;
  readonly textBgImage: string;
  readonly textLogo: string;
  readonly trailer_video: string;
  readonly video?: string;
  readonly rating: number;
  readonly isFree: boolean;
  readonly popularityScore: number;
  readonly metacriticScore: number;
  readonly officialWebsite: string;
  readonly ageRating: string;
  readonly rawgId: string;
  readonly cheapsharkId: string;
  readonly isReleased: boolean;
  readonly status: status;
  readonly isCategorized: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly genreMappings: string[];
  readonly tagsMapping: string[];
  readonly platformsMapping: string[];
  readonly developer: string[];
  readonly publisher: string[];
  readonly storesMapping: PurchaseStore[];
  readonly preferredStore: string;
  readonly warningMessage: string;
  readonly isInstallAndPlay: boolean;

  readonly backgroundImageBlurhash: ImageHash | null;
  readonly posterImageBlurhash: ImageHash | null;
  readonly textBackgroundImageBlurhash: ImageHash | null;
  readonly textLogoBlurhash: ImageHash | null;
  readonly iapDetailsBlurhash: ImageHash | null;
  readonly iapLoadingBlurHash: ImageHash | null;
  readonly iapRailBlurhash: ImageHash | null;
  readonly iapSearchBlurhash: ImageHash | null;
  readonly defaultBlurHash = "KID[^H=^4o~pW-9Gg4M|IU";

  readonly installPlaySearchImg: string;
  readonly installPlayRailImg: string;
  readonly installPlayLoadingImg: string;
  readonly installPlayDetailImg: string;
  readonly installPlayDetailImgMob: string;
  readonly installPlayDetailImgTab: string;


  readonly poster_1_1: string;
  readonly poster_1_1_blurhash: string;
  readonly poster_3_4: string;
  readonly poster_3_4_blurhash: string;
  readonly poster_16_9: string;
  readonly poster_16_9_blurhash: string;
  readonly poster_hero_banner_1_1: string;
  readonly poster_hero_banner_1_1_blurhash: string;
  readonly poster_hero_banner_16_9: string;
  readonly poster_hero_banner_16_9_blurhash: string;
  readonly video_hero_banner_1_1: string;
  readonly video_hero_banner_16_9: string;



  constructor(json: { [key: string]: any }) {
    this.id = json["id"];
    this.oneplayId = json["oplay_id"];
    this.title = json["title"];
    this.description = json["description"];
    this.playTime = json["play_time"];
    this.releaseDate = new Date(json["release_date"]);
    this.posterImg = json["poster_image"];
    this.bgImage = json["background_image"];
    this.textBgImage = json["text_background_image"];
    this.textLogo = json["text_logo"];
    this.trailer_video = json["trailer_video"];
    this.video = json["videos"]?.[0];
    this.rating = json["rating"];
    this.isFree = json["is_free"] === "true";
    this.popularityScore = json["popularity_score"];
    this.metacriticScore = json["metacritic_score"];
    this.officialWebsite = json["official_website"];
    this.ageRating = json["age_rating"];
    this.rawgId = json["rawg_id"];
    this.cheapsharkId = json["cheapshark"];
    this.isReleased = json["is_released"];
    this.status = json["status"];
    this.isCategorized = json["is_categorized"];
    this.createdAt = new Date(json["created_at"] * 1000);
    this.updatedAt = new Date(json["updated_at"] * 1000);
    this.genreMappings = json["genre_mappings"];
    this.tagsMapping = json["tags_mapping"];
    this.platformsMapping = json["platforms_mapping"];
    this.developer = json["developer"];
    this.publisher = json["publisher"];
    this.storesMapping = json["stores_mappings"];
    this.preferredStore = json["preferred_store"];
    this.warningMessage = json["warning_message"];
    this.isInstallAndPlay = json["is_install_and_play"] === "true";

    this.poster_16_9 = json["poster_16_9"];
    this.poster_16_9_blurhash = json["poster_16_9_blurhash"];

    this.installPlaySearchImg = json["install_and_play_search_image"];
    this.installPlayDetailImg = json["install_and_play_details_image"];
    this.installPlayRailImg = json["install_and_play_rail_image"];
    this.installPlayLoadingImg = json["install_and_play_loading_image"];
    this.installPlayDetailImgMob =
      json["install_and_play_details_image_android"];
    this.installPlayDetailImgTab =
      json["install_and_play_details_image_tablet"];

    this.backgroundImageBlurhash = JSON.parse(
      json["background_image_blurhash"] ?? "null"
    );
    this.posterImageBlurhash = JSON.parse(
      json["poster_image_blurhash"] ?? "null"
    );
    this.textLogoBlurhash = JSON.parse(json["text_logo_blurhash"] ?? "null");
    this.textBackgroundImageBlurhash = JSON.parse(
      json["text_background_image_blurhash"] ?? "null"
    );
    this.iapDetailsBlurhash = JSON.parse(
      json["install_and_play_details_blurhash"] ?? "null"
    );
    this.iapLoadingBlurHash = JSON.parse(
      json["install_and_play_loading_blurhash"] ?? "null"
    );
    this.iapRailBlurhash = JSON.parse(
      json["install_and_play_rail_blurhash"] ?? "null"
    );
    this.iapSearchBlurhash = JSON.parse(
      json["install_and_play_search_blurhash"] ?? "null"
    );
  }

  get bgHash() {
    return this.backgroundImageBlurhash?.blurhash ?? this.defaultBlurHash;
  }

  get posterHash() {
    return this.posterImageBlurhash?.blurhash ?? this.defaultBlurHash;
  }

  get textLogoHash() {
    return this.textLogoBlurhash?.blurhash ?? this.defaultBlurHash;
  }

  get textBgHash() {
    return this.textBackgroundImageBlurhash?.blurhash ?? this.defaultBlurHash;
  }

  get iapBgHash() {
    return this.iapDetailsBlurhash?.blurhash ?? this.defaultBlurHash;
  }

  get iapLoadingHash() {
    return this.iapLoadingBlurHash?.blurhash ?? this.defaultBlurHash;
  }

  get iapRailHash() {
    return this.iapRailBlurhash?.blurhash ?? this.defaultBlurHash;
  }

  get iapSearchHash() {
    return this.iapSearchBlurhash?.blurhash ?? this.defaultBlurHash;
  }
}
