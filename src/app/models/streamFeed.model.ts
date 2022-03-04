import { VideoModel } from "./video.model";

export class VideoFeedModel {
  id: string;
  title: string;
  videos: VideoModel[];

  constructor(json: any) {
    this.id = json.oplay_id;
    this.title = json.title;
    this.videos = json.videos.map((video) => new VideoModel(video));
  }
}
