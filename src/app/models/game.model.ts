import { PurchaseStore } from "../interface";

export class GameModel {
    readonly id: number;
    readonly oneplayId: string;
    readonly title: string;
    readonly description: string;
    readonly playTime: number;
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
    readonly status: string;
    readonly isCategorized: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly genreMappings: string[];
    readonly tagsMapping: string[];
    readonly platformsMapping: string[];
    readonly developer: string[];
    readonly publisher: string[];
    readonly storesMapping: PurchaseStore[];

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
        this.isFree = json["is_free"] === 'true';
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
    }
}