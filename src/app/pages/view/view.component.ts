import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GameModel } from "src/app/models/game.model";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { VideoModel } from "src/app/models/video.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit {
  game: GameModel;
  playing: string = "";
  showAllVideos = false;
  showAllLiveVideos = false;

  similarGames: GameModel[] = [];
  devGamesMap: GameFeedModel[] = [];
  genreGamesMap: GameFeedModel[] = [];

  private _videos: VideoModel[] = [];
  private _liveVideos: VideoModel[] = [];

  constructor(
    private readonly location: Location,
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private readonly ngbModal: NgbModal,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.restService.getGameDetails(params.id).subscribe((game) => {
        this.game = game;
        this.title.setTitle("OnePlay | Play " + game.title);
        this.meta.addTags([
          { name: "keywords", content: game.tagsMapping?.join(", ") },
          { name: "description", content: game.description },
        ]);
        Promise.all(
          game.developer.map((dev) =>
            this.restService
              .getGamesByDeveloper(dev)
              .toPromise()
              .then((games) => ({ title: `More from ${dev}`, games }))
          )
        ).then((map) => (this.devGamesMap = map));
        Promise.all(
          game.genreMappings.map((genre) =>
            this.restService
              .getGamesByGenre(genre)
              .toPromise()
              .then((games) => ({ title: `More in ${genre}`, games }))
          )
        ).then((map) => (this.genreGamesMap = map));
      });
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
    return !this.showAllVideos ? this._videos.slice(0, 3) : this._videos;
  }

  get liveVideos(): VideoModel[] {
    return !this.showAllLiveVideos
      ? this._liveVideos.slice(0, 3)
      : this._liveVideos;
  }

  open(content: any, video: VideoModel): void {
    this.playing = video.youtube_url.replace("watch?v=", "embed/");
    this.ngbModal.open(content, {
      modalDialogClass: "modal-xl",
      centered: true,
    });
  }

  back(): void {
    this.location.back();
  }
}
