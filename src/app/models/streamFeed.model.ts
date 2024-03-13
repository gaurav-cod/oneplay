import { VideoModel } from "./video.model";

export class VideoFeedModel {
  readonly id: string;
  readonly videos: VideoModel[];
  readonly title: string;
  readonly categories: string[];
  readonly type: "landscape_video" = "landscape_video";
  readonly contentId: string;

  constructor(json: any) {
    this.id = json.oplay_id;
    this.title = json.title;
    this.videos = json.results.map((video) => new VideoModel(video));
  }
}
