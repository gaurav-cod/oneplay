import { Component, OnInit } from "@angular/core";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { VideoFeedModel } from "src/app/models/streamFeed.model";
import { VideoModel } from "src/app/models/video.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-streams",
  templateUrl: "./streams.component.html",
  styleUrls: ["./streams.component.scss"],
})
export class StreamsComponent implements OnInit {
  banners: VideoModel[] = [];
  feeds: VideoFeedModel[] = [];

  constructor(
    private readonly restService: RestService,
    private readonly loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.restService.getStreamsFeed().subscribe(
      (feeds) => {
        this.banners = feeds.find((f) => f.id === "banner")?.videos || [];
        this.feeds = feeds.filter(
          (f) => f.id !== "banner" && f.videos.length > 0
        );
        this.loaderService.stop();
      },
      (error) => {
        this.loaderService.stop();
      }
    );
  }
}
