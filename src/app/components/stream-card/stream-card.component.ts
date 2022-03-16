import { Component, Input, OnInit } from "@angular/core";
import { VideoWithGameId } from "src/app/interface";
import { VideoModel } from "src/app/models/video.model";

@Component({
  selector: "app-stream-card",
  templateUrl: "./stream-card.component.html",
  styleUrls: ["./stream-card.component.scss"],
})
export class StreamCardComponent implements OnInit {
  @Input("gameId") gameId: string;
  @Input("video") video: VideoModel;

  get image(): string {
    return this.video.thumbnails.medium.url;
  }

  get title(): string {
    return this.video.title;
  }

  get channel(): string {
    return this.video.channelTitle;
  }

  get id(): string {
    const data: VideoWithGameId = {
      gameId: this.gameId,
      video: this.video,
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  constructor() {}

  ngOnInit(): void {}
}
