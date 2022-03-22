import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { VideoWithGameId } from "src/app/interface";
import { VideoModel } from "src/app/models/video.model";

@Component({
  selector: "app-stream-card",
  templateUrl: "./stream-card.component.html",
  styleUrls: ["./stream-card.component.scss"],
})
export class StreamCardComponent implements OnInit {
  @Input("title") title: string;
  @Input("gameId") gameId: string;
  @Input("videos") videos: VideoModel[];

  @ViewChild("container") containerRef: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  getId(video: VideoModel): string {
    const data: VideoWithGameId = {
      gameId: this.gameId,
      video,
    };
    return encodeURIComponent(JSON.stringify(data));
  }

  scrollRight() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(function () {
      container.scrollLeft += container.clientWidth / 12;
      scrollAmount += container.clientWidth / 12;
      if (scrollAmount >= container.clientWidth / 2) {
        window.clearInterval(slideTimer);
      }
    }, 25);
  }

  scrollLeft() {
    const container = this.containerRef.nativeElement;
    let scrollAmount = 0;
    const slideTimer = setInterval(function () {
      container.scrollLeft -= container.clientWidth / 12;
      scrollAmount += container.clientWidth / 12;
      if (scrollAmount >= container.clientWidth / 2) {
        window.clearInterval(slideTimer);
      }
    }, 25);
  }
}
