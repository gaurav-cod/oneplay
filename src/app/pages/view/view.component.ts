import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
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
  playing: string = "";
  showAllVideos = false;
  showAllLiveVideos = false;

  similarGames: GameModel[] = [];

  private _devGames: GameModel[] = [];
  private _genreGames: GameModel[] = [];

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
      const id = (params.id as string).replace(/(.*)\-/g, "");
      this.restService.getGameDetails(id).subscribe((game) => {
        this.game = game;
        this.title.setTitle("OnePlay | Play " + game.title);
        this.meta.addTags([
          { name: "keywords", content: game.tagsMapping?.join(", ") },
          { name: "description", content: game.description },
        ]);
        game.developer.forEach((dev) =>
          this.restService
            .getGamesByDeveloper(dev)
            .subscribe((games) => this._devGames = [...this._devGames, ...games])
        );
        game.genreMappings.forEach((genre) =>
          this.restService
            .getGamesByGenre(genre)
            .subscribe((games) => this._genreGames = [...this._genreGames, ...games])
        );
      });
      this.restService
        .getSimilarGames(id)
        .subscribe((games) => (this.similarGames = games));
      this.restService
        .getVideos(id)
        .subscribe((videos) => (this._videos = videos));
      this.restService
        .getLiveVideos(id)
        .subscribe((videos) => (this._liveVideos = videos));
    });
  }

  get devGames(): GameModel[] {
    return [...this._devGames].sort(
      (a, b) => a.popularityScore - b.popularityScore
    );
  }

  get allDevelopers(): string {
    return "From " + this.game?.developer?.join(", ") || "";
  }

  get genreGames(): GameModel[] {
    return [...this._genreGames].sort(
      (a, b) => a.popularityScore - b.popularityScore
    );
  }

  get allGenres(): string {
    return "From " + this.game?.genreMappings?.join(", ") || "";
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
