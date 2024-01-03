
export class GamezopModel {
    readonly code: string;
    readonly colorMuted: string;
    readonly colorVibrant: string;
    readonly description: string;
    readonly gamePlays: number;
    readonly gamePreviews: string;
    readonly name: string;
    readonly noOfRating: number;
    readonly rating: number;
    readonly url: string;
    readonly tags: string[];
    readonly categories: string[];
    readonly assets: any;

    constructor(json: { [key: string]: any }) {
        this.code = json["code"];
        this.colorMuted = json["color_muted"];
        this.colorVibrant = json["color_vibrant"];
        this.description = json["description"];
        this.gamePlays = json["game_plays"];
        this.gamePreviews = json["game_previews"];
        this.name = json["name"];
        this.noOfRating = json["number_of_rating"];
        this.rating = json["rating"];
        this.url = json["url"];
        this.tags = json["tags"];
        this.categories = json["categories"];
        this.assets = json["assets"];
    }
}