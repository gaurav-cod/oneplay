import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { VideoModel } from "src/app/models/video.model";
import { AuthService } from "src/app/services/auth.service";
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
  startingGame = false;

  similarGames: GameModel[] = [];

  loadingWishlist = false;

  private _devGames: GameModel[] = [];
  private _genreGames: GameModel[] = [];

  private _videos: VideoModel[] = [];
  private _liveVideos: VideoModel[] = [];

  private wishlist: string[] = [];

  constructor(
    private readonly location: Location,
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly ngbModal: NgbModal,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly loaderService: NgxUiLoaderService,
    private readonly toastr: ToastrService
  ) {
    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = wishlist)
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = (params.id as string).replace(/(.*)\-/g, "");
      this.loaderService.start();
      this.restService.getGameDetails(id).subscribe(
        (game) => {
          this.game = game;
          this.title.setTitle("OnePlay | Play " + game.title);
          this.meta.addTags([
            { name: "keywords", content: game.tagsMapping?.join(", ") },
            { name: "description", content: game.description },
          ]);
          game.developer.forEach((dev) =>
            this.restService
              .getGamesByDeveloper(dev)
              .subscribe(
                (games) => (this._devGames = [...this._devGames, ...games])
              )
          );
          game.genreMappings.forEach((genre) =>
            this.restService
              .getGamesByGenre(genre)
              .subscribe(
                (games) => (this._genreGames = [...this._genreGames, ...games])
              )
          );
          this.loaderService.stop();
        },
        (err) => this.loaderService.stop()
      );
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

  get isInWishlist(): boolean {
    return this.wishlist.includes(this.game?.oneplayId);
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

  get releaseYear() {
    return this.game?.releaseDate.getFullYear();
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

  addToWishlist(): void {
    this.loadingWishlist = true;
    this.restService.addWishlist(this.game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.addToWishlist(this.game.oneplayId);
    });
  }

  removeFromWishlist(): void {
    this.loadingWishlist = true;
    this.restService.removeWishlist(this.game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.removeFromWishlist(this.game.oneplayId);
    });
  }

  startGame(): void {
    this.startLoading();
    this.restService.startGame(this.game.oneplayId).subscribe(
      (data) => {
        if (data.api_action === "call_session") {
          this.startGameWithClientToken(data.session.id);
        } else if (data.api_action === "call_terminate") {
          this.terminateGame(data.session.id);
        } else {
          this.toastr.error("Something went wrong");
          this.stopLoading();
        }
      },
      (err) => {
        this.toastr.error(err, "Start Game");
        this.stopLoading();
      }
    );
  }

  private startGameWithClientToken(sessionId: string): void {
    this.toastr.info("Initializing game...");
    let seconds = 0;
    const timer = setInterval(() => {
      this.restService.getClientToken(sessionId).subscribe(
        (token) => {
          if (!!token) {
            clearInterval(timer);
            this.stopLoading();
            window.location.href = `oneplay:key?${token}`;
          }
        },
        (err) => {
          this.toastr.error(err, "Start Game");
          this.stopLoading();
          clearInterval(timer);
        }
      );
      seconds++;
      if (seconds > 60) {
        this.toastr.error("Session expired", "Start Game");
        this.stopLoading();
        clearInterval(timer);
      }
    }, 1000);
  }

  private terminateGame(sessionId: string): void {
    if (
      confirm("You are already playing a game. Do you want to terminate it?")
    ) {
      this.restService.terminateGame(sessionId).subscribe(
        () => {
          this.startGame();
        },
        (err) => {
          this.toastr.error(err, "Terminate Game");
          this.stopLoading();
        }
      );
    } else {
      this.stopLoading();
    }
  }
  
  private startLoading(): void {
    this.startingGame = true;
    this.loaderService.startLoader('play-loader');
  }

  private stopLoading(): void {
    this.startingGame = false;
    this.loaderService.stopLoader('play-loader');
  }
}
