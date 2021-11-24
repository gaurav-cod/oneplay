import { GameModel } from "./models/game.model";
import { GameFeedModel } from "./models/gameFeed.model";

export interface LoginDTO {
    email: string;
    password: string;
}

export interface SignupDTO {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    gender: 'male' | 'female';
}

export interface StartPcRO {
    success: boolean;
    msg: string;
}

export interface HomeFeeds {
    games: GameFeedModel[];
    categories: any[];
    banners: GameModel[];
}