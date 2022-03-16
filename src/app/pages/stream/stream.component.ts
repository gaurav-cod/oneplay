import { Component, OnInit } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { VideoWithGameId } from "src/app/interface";
import { GameModel } from "src/app/models/game.model";
import { VideoModel } from "src/app/models/video.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-stream",
  templateUrl: "./stream.component.html",
  styleUrls: ["./stream.component.scss"],
})
export class StreamComponent implements OnInit {
  chats = [];
  game: GameModel;
  video: VideoModel;
  topVideos: VideoModel[] = [];

  get playing() {
    return this.video?.youtube_url.replace("watch?v=", "embed/") || "";
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly restService: RestService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const data: VideoWithGameId = JSON.parse(decodeURIComponent(params.id));
      this.title.setTitle("OnePlay | Watch " + data.video.title);
      this.meta.addTags([
        { name: "keywords", content: data.video.channelTitle },
        { name: "description", content: data.video.description },
      ]);
      this.video = data.video;
      this.restService.getGameDetails(data.gameId).subscribe((game) => {
        this.game = game;
      });
      this.restService.getVideos(data.gameId).subscribe((videos) => {
        this.topVideos = videos;
      });
    });
  }
}
