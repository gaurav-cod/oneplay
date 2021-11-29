import { Thumbnail } from "../interface";

export class VideoModel {
    readonly title: string;
    readonly description: string;
    readonly thumbnails: {
        default: Thumbnail;
        medium: Thumbnail;
        high: Thumbnail;
    };
    readonly channelTitle: string;
    readonly liveBroadcastContent: string;
    readonly publishTime: Date;
    readonly youtube_url: string;

    constructor(data: any) {
        this.title = data.title;
        this.description = data.description;
        this.thumbnails = data.thumbnails;
        this.channelTitle = data.channelTitle;
        this.liveBroadcastContent = data.liveBroadcastContent;
        this.publishTime = new Date(data.publishTime);
        this.youtube_url = data.youtube_url;
    }
}