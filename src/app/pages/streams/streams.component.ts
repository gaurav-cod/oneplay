import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, NavigationEnd } from "@angular/router";
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
    private readonly loaderService: NgxUiLoaderService,
    private readonly title: Title,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Streams");
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
        if(error.timeout) {
          this.router.navigateByUrl('/server-error')
        }
        this.loaderService.stop();
      }
    );
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0)
    });
  }

  getId(video: VideoModel): string {
    return encodeURIComponent(JSON.stringify({ video }));
  }

  nFormatter(num: number, digits: number) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value;
      });
    return item
      ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
  }
}
