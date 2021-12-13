import { Component, OnInit } from "@angular/core";
import { GameModel } from "src/app/models/game.model";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  firstRow: GameFeedModel;
  restRows: GameFeedModel[] = [];

  constructor(private readonly restService: RestService) {
    this.restService.getHomeFeed().subscribe((res) => {
      this.firstRow = res.games[0];
      this.restRows = res.games.slice(1);
    });
  }

  ngOnInit(): void {
    document.body.click();
  }

  scrollRight(id: string) {
    const container = document.getElementById(id);
    let scrollAmount = 0;
    const slideTimer = setInterval(function(){
        container.scrollLeft += (container.clientWidth / 12);
        scrollAmount += (container.clientWidth / 12);
        if(scrollAmount >= (container.clientWidth / 2)){
            window.clearInterval(slideTimer);
        }
    }, 25);
  }

  scrollLeft(id: string) {
    const container = document.getElementById(id);
    let scrollAmount = 0;
    const slideTimer = setInterval(function(){
        container.scrollLeft -= (container.clientWidth / 12);
        scrollAmount += (container.clientWidth / 12);
        if(scrollAmount >= (container.clientWidth / 2)){
            window.clearInterval(slideTimer);
        }
    }, 25);
  }

  playVideo(video: HTMLVideoElement, image: HTMLImageElement, game: GameModel) {
    if (game.video) {
      image.style.opacity = "0";
      video.play();
    }
  }

  pauseVideo(
    video: HTMLVideoElement,
    image: HTMLImageElement,
    game: GameModel
  ) {
    if (game.video) {
      image.style.opacity = "1";
      video.pause();
      video.currentTime = 0;
    }
  }
}
