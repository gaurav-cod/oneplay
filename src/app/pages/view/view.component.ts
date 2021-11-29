import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GameModel } from "src/app/models/game.model";
import { VideoModel } from "src/app/models/video.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit {
  game: GameModel;
  similarGames: GameModel[] = [];
  videos: VideoModel[] = [];
  liveVideos: VideoModel[] = [];
  playing: string = "";

  constructor(
    private readonly location: Location,
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private readonly ngbModal: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.restService
        .getGameDetails(params.id)
        .subscribe((game) => (this.game = game));
      this.restService
        .getSimilarGames(params.id)
        .subscribe((games) => (this.similarGames = games));
      this.restService
        .getVideos(params.id)
        .subscribe((videos) => (this.videos = videos));
      this.restService
        .getLiveVideos(params.id)
        .subscribe((videos) => (this.liveVideos = videos));
    });
  }

  open(content: any, video: VideoModel): void {
    this.playing = video.youtube_url.replace("watch?v=", "embed/");
    this.ngbModal.open(content);
  }

  back(): void {
    this.location.back();
  }
}
