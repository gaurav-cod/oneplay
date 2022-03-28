import { Location } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { UserModel } from "src/app/models/user.model";
import { VideoModel } from "src/app/models/video.model";
import { AuthService } from "src/app/services/auth.service";
import { GameService } from "src/app/services/game.service";
import { RestService } from "src/app/services/rest.service";
import { PlayConstants } from "./play-constants";

declare var gtag: Function;

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

  constants = PlayConstants;
  allowedResolutions: string[] = [];

  resolution = new FormControl("");
  fps = new FormControl(PlayConstants.DEFAULT_FPS);
  vsync = new FormControl(PlayConstants.VSYNC[1].value);
  action: "Play" | "Resume" | "Terminate" = "Play";
  user: UserModel;
  sessionToTerminate = "";

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
    private readonly toastr: ToastrService,
    private readonly gameService: GameService
  ) {
    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = wishlist)
    );
    this.authService.user.subscribe((user) => {
      if (user) {
        const resolutionFromLocalStorage = localStorage.getItem("resolution");
        const fpsFromLocalStorage = localStorage.getItem("fps");
        const vsyncFromLocalStorage = localStorage.getItem("vsync");
        this.resolution.setValue(
          resolutionFromLocalStorage ||
            PlayConstants.DEFAULT_RESOLUTIONS[user.subscribedPlan]
        );
        this.fps.setValue(fpsFromLocalStorage || PlayConstants.DEFAULT_FPS);
        this.vsync.setValue(
          vsyncFromLocalStorage || PlayConstants.VSYNC[1].value
        );
        this.allowedResolutions =
          PlayConstants.RESOLUTIONS_PACKAGES[user.subscribedPlan];
        this.user = user;
      }
    });
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
                (games) =>
                  (this._devGames = this.getShuffledGames([
                    ...this._devGames,
                    ...games,
                  ]))
              )
          );
          game.genreMappings.forEach((genre) =>
            this.restService
              .getGamesByGenre(genre)
              .subscribe(
                (games) =>
                  (this._genreGames = this.getShuffledGames([
                    ...this._genreGames,
                    ...games,
                  ]))
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
      this.gameService.gameStatus.subscribe((status) => {
        if (status && status.game_id === id) {
          if (status.is_running && !status.is_user_connected) {
            this.action = "Resume";
          } else if (status.is_running && status.is_user_connected) {
            this.action = "Terminate";
            this.sessionToTerminate = status.session_id;
          } else {
            this.action = "Play";
          }
        } else {
          this.action = "Play";
        }
      });
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
      gtag("event", "add_to_wishlist", {
        event_category: "wishlist",
        event_label: this.game.title,
      });
    });
  }

  removeFromWishlist(): void {
    this.loadingWishlist = true;
    this.restService.removeWishlist(this.game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.removeFromWishlist(this.game.oneplayId);
      gtag("event", "remove_from_wishlist", {
        event_category: "wishlist",
        event_label: this.game.title,
      });
    });
  }

  playGame(container): void {
    if (this.user.status !== "active") {
      this.toastr.error(
        "Your account needs to be activated by Oneplay to play games",
        "Error"
      );
      return;
    }
    if (!this.user.subscriptionIsActive) {
      this.toastr.error(
        "Your subscription is not active. Please renew your subscription",
        "Error"
      );
      return;
    }
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  terminateSession(): void {
    this.startLoading();
    this.restService
      .terminateGame(this.sessionToTerminate)
      .subscribe(() => {
        this.toastr.success("Session terminated", "Success");
        this.gameService.gameStatus = this.restService.getGameStatus();
        this.stopLoading();
      }, (err) => {
        this.toastr.error("Something went wrong", "Error");
        this.stopLoading();
      });
  }

  startGame(): void {
    this.ngbModal.dismissAll();
    localStorage.setItem("resolution", this.resolution.value);
    localStorage.setItem("fps", this.fps.value);
    localStorage.setItem("vsync", this.vsync.value);
    gtag("event", "start_game", {
      event_category: "game",
      event_label: this.game.title,
    });
    this.startLoading();
    this.restService
      .startGame(
        this.game.oneplayId,
        this.resolution.value,
        this.vsync.value,
        this.fps.value,
        PlayConstants.getIdleBitrate(this.resolution.value, this.fps.value)
      )
      .subscribe(
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
            this.gameService.gameStatus = this.restService.getGameStatus();
          }
        },
        (err) => {
          this.toastr.error(err, "Start Game");
          this.stopLoading();
          clearInterval(timer);
        }
      );
      seconds = seconds + 3;
      if (seconds > 60) {
        this.toastr.error("Session expired", "Start Game");
        this.stopLoading();
        clearInterval(timer);
      }
    }, 3000);
  }

  private terminateGame(sessionId: string): void {
    if (
      confirm("You are already playing a game. Do you want to terminate it?")
    ) {
      this.restService.terminateGame(sessionId).subscribe(
        () => {
          setTimeout(() => {
            this.startGame();
          }, 2000);
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
    this.loaderService.startLoader("play-loader");
  }

  private stopLoading(): void {
    this.startingGame = false;
    this.loaderService.stopLoader("play-loader");
  }

  private getShuffledGames(games: GameModel[]): GameModel[] {
    return [...games].sort(() => Math.random() - 0.5);
  }
}
