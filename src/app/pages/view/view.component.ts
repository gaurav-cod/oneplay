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
  playing: string = "";
  
  private _videos: VideoModel[] = [];
  private _liveVideos: VideoModel[] = [];

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
        .subscribe((videos) => (this._videos = videos));
      this.restService
        .getLiveVideos(params.id)
        .subscribe((videos) => (this._liveVideos = videos));
    });
  }

  get videos(): VideoModel[] {
    return this._videos.slice(0, 10);
  }

  get liveVideos(): VideoModel[] {
    return this._liveVideos.slice(0, 10);
  }

  open(content: any, video: VideoModel): void {
    this.playing = video.youtube_url.replace("watch?v=", "embed/");
    this.ngbModal.open(content);
  }

  back(): void {
    this.location.back();
  }
}
