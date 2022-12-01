import { Location } from "@angular/common";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import Cookies from "js-cookie";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { combineLatest, zip } from "rxjs";
import { GameModel } from "src/app/models/game.model";
import { UserModel } from "src/app/models/user.model";
import { VideoModel } from "src/app/models/video.model";
import { AuthService } from "src/app/services/auth.service";
import { GameService } from "src/app/services/game.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";
import { UAParser } from "ua-parser-js";
import { PlayConstants } from "./play-constants";

declare var gtag: Function;

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit, OnDestroy {
  @ViewChild("initializedModal") initializedModal: ElementRef<HTMLDivElement>;
  @ViewChild("launchModal") launchModal: ElementRef<HTMLDivElement>;

  initialized: string = "Please Wait......";
  isReadMore = true;

  game: GameModel;
  playing: string = "";
  startingGame = false;
  terminatingGame = false;

  similarGames: GameModel[] = [];

  loadingWishlist = false;

  constants = PlayConstants;
  allowedResolutions: string[] = [];

  resolution = new FormControl();
  fps = new FormControl();
  vsync = new FormControl();
  action: "Play" | "Resume" = "Play";
  user: UserModel;
  sessionToTerminate = "";

  videos: VideoModel[] = [];
  liveVideos: VideoModel[] = [];

  showSettings = new FormControl();

  advancedOptions = new FormGroup({
    absolute_mouse_mode: new FormControl(false),
    absolute_touch_mode: new FormControl(false),
    background_gamepad: new FormControl(false),
    audio_type: new FormControl("stereo"),
    stream_codec: new FormControl("auto"),
    video_decoder_selection: new FormControl("auto"),
  });

  private _devGames: GameModel[] = [];
  private _genreGames: GameModel[] = [];
  private _clientToken: string;
  private wishlist: string[] = [];
  private _timer: NodeJS.Timer;
  private _initializedModalRef: NgbModalRef;
  private _settingsModalRef: NgbModalRef;

  constructor(
    private readonly location: Location,
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly ngbModal: NgbModal,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly loaderService: NgxUiLoaderService,
    private readonly gameService: GameService
  ) {
    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = wishlist)
    );
    this.authService.user.subscribe((user) => {
      if (user) {
        const resolution = localStorage.getItem("resolution");
        this.resolution.setValue(
          resolution ||
            PlayConstants.DEFAULT_RESOLUTIONS[user.subscribedPlan ?? "Founder"]
        );
        this.allowedResolutions =
          PlayConstants.RESOLUTIONS_PACKAGES[user.subscribedPlan ?? "Founder"];
        this.user = user;
      }
    });
    const showSettings = localStorage.getItem("showSettings");
    this.showSettings.setValue(showSettings ? showSettings === "true" : true);
    this.showSettings.valueChanges.subscribe((showSettings) => {
      localStorage.setItem("showSettings", showSettings);
    });

    const fps = localStorage.getItem("fps");
    this.fps.setValue(fps || PlayConstants.DEFAULT_FPS);

    const vsync = localStorage.getItem("vsync");
    this.vsync.setValue(vsync ? vsync === "true" : true);

    const advancedOptions = localStorage.getItem("advancedOptions");
    if (advancedOptions) {
      this.advancedOptions.setValue(JSON.parse(advancedOptions));
    }
  }

  ngOnDestroy(): void {
    if (this.startingGame) {
      this.stopLoading();
    }
    if (this._timer) {
      clearInterval(this._timer);
    }
  }

  ngOnInit(): void {
    const paramsObservable = this.route.params.pipe();
    const queryParamsObservable = this.route.queryParams.pipe();
    combineLatest(paramsObservable, queryParamsObservable).subscribe(
      (params) => {
        const id = (params[0].id as string).replace(/(.*)\-/g, "");
        const keyword = params[1].keyword;
        const keywordHash = params[1].hash;
        this.stopLoading();
        this.loaderService.start();
        this.restService
          .getGameDetails(id, {
            keyword,
            keywordHash,
          })
          .subscribe(
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
          .subscribe((videos) => (this.videos = videos));
        this.restService
          .getLiveVideos(id)
          .subscribe((videos) => (this.liveVideos = videos));
        this.gameService.gameStatus.subscribe((status) => {
          if (!this.startingGame) {
            if (status && status.game_id === id) {
              if (status.is_running) {
                this.action = "Resume";
              } else {
                this.action = "Play";
              }
              this.sessionToTerminate = status.session_id;
            } else {
              this.action = "Play";
            }
          }
        });
      }
    );
  }

  get isInWishlist(): boolean {
    return this.wishlist.includes(this.game?.oneplayId);
  }

  get devGames(): GameModel[] {
    return [...this._devGames]
      .filter((game) => game.oneplayId !== this.game.oneplayId)
      .sort((a, b) => a.popularityScore - b.popularityScore);
  }

  get allDevelopers(): string {
    return "From " + this.game?.developer?.join(", ") || "";
  }

  get genreGames(): GameModel[] {
    return [...this._genreGames]
      .filter((game) => game.oneplayId !== this.game.oneplayId)
      .sort((a, b) => a.popularityScore - b.popularityScore);
  }

  get allGenres(): string {
    return "From " + this.game?.genreMappings?.join(", ") || "";
  }

  get releaseYear() {
    return this.game?.releaseDate.getFullYear();
  }

  get deviceResolution() {
    return `${screen.width}x${screen.height}`;
  }

  get allowAutoResolution() {
    return (
      PlayConstants.MAX_RESOLUTION_WIDTH[this.user?.subscribedPlan] >=
      screen.width
    );
  }

  get audio_type() {
    return this.advancedOptions.value?.audio_type;
  }

  get stream_codec() {
    return this.advancedOptions.value?.stream_codec;
  }

  get video_decoder_selection() {
    return this.advancedOptions.value?.video_decoder_selection;
  }

  get clientDownloadLink() {
    const userAgent = new UAParser(window.navigator.userAgent);
    switch (userAgent.getOS().name) {
      case "Windows":
        return "https://cdn.edge-net.co/clients/latest/windows_client.exe";
      case "Mac OS":
        return "https://cdn.edge-net.co/clients/latest/mac_client.dmg";
      case "Android":
        return "";
      default:
        return "";
    }
  }

  get exitCommand() {
    const userAgent = new UAParser(window.navigator.userAgent);
    switch (userAgent.getOS().name) {
      case "Windows":
        return "Ctrl + Alt + Shift + Q";
      case "Mac OS":
        return "Control + Option + Shift + Q";
      default:
        return "";
    }
  }

  open(content: any, video: VideoModel): void {
    this.playing = video.sourceLink.replace("watch?v=", "embed/");
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
      Swal.fire({
        title: "Opps...",
        text: "Your account needs to be subjected to availability by Oneplay to play games",
        icon: "error",
      });
      return;
    }
    if (!this.user.subscriptionIsActive || !this.user.subscribedPlan) {
      Swal.fire({
        title: "Opps...",
        text: "Your subscription is not active. Please renew your subscription",
        icon: "error",
      });
      return;
    }
    if (this.showSettings.value) {
      this._settingsModalRef = this.ngbModal.open(container, {
        centered: true,
        modalDialogClass: "modal-md",
      });
    } else {
      this.startGame();
    }
  }

  openAdvanceOptions(container): void {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
    });
  }

  terminateSession(): void {
    this.startTerminating();
    this.restService.terminateGame(this.sessionToTerminate).subscribe(
      () => {
        Swal.fire({
          title: "Session terminated",
          text: "Your session has been terminated",
          icon: "success",
          confirmButtonText: "OK",
        });
        setTimeout(() => {
          this.gameService.gameStatus = this.restService.getGameStatus();
        }, 3000);
        this.stopTerminating();
      },
      (err) => {
        Swal.fire({
          title: "Opps...",
          text: err || "Something went wrong",
          icon: "error",
          confirmButtonText: "OK",
        });
        this.stopTerminating();
      }
    );
  }

  launchGame() {
    const userAgent = new UAParser(window.navigator.userAgent);
    if (userAgent.getOS().name === "Android") {
      window.open(
        `https://www.oneplay.in/launch/app?payload=${this._clientToken}`,
        "_blank"
      );
    } else {
      window.location.href = `oneplay:key?${this._clientToken}`;
    }
  }

  startGame(): void {
    if (this.startingGame) {
      return;
    }

    localStorage.setItem("resolution", this.resolution.value);
    localStorage.setItem("fps", this.fps.value);
    localStorage.setItem("vsync", this.vsync.value);
    localStorage.setItem(
      "advancedOptions",
      JSON.stringify(this.advancedOptions.value)
    );

    gtag("event", "start_game", {
      event_category: "game",
      event_label: this.game.title,
    });

    this._settingsModalRef?.close();
    this.startLoading();

    this.restService
      .startGame(
        this.game.oneplayId,
        this.resolution.value,
        this.vsync.value,
        this.fps.value,
        PlayConstants.getIdleBitrate(this.resolution.value, this.fps.value),
        this.advancedOptions.value
      )
      .subscribe(
        (data) => {
          if (data.data.api_action === "call_session") {
            this.startGameWithClientToken(data.data.session.id);
          } else if (data.data.api_action === "call_terminate") {
            this.terminateGame(data.data.session.id);
          } else {
            this.stopLoading();
            Swal.fire({
              title: "Opps...",
              text: data.msg || "Something went wrong",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        },
        (err) => {
          this.stopLoading();
          Swal.fire({
            title: "Opps...",
            text: err || "Something went wrong",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      );
  }

  private startGameWithClientToken(sessionId: string): void {
    let seconds = 0;
    // open inistialized Modal here
    this._initializedModalRef = this.ngbModal.open(this.initializedModal, {
      centered: true,
      modalDialogClass: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });

    this._timer = setInterval(() => {
      this.restService.getClientToken(sessionId).subscribe(
        (data) => {
          if (!!data.client_token) {
            clearInterval(this._timer);

            this._clientToken = data.client_token;
            this.launchGame();

            setTimeout(() => {
              this.stopLoading();
              this.ngbModal.open(this.launchModal, {
                centered: true,
                modalDialogClass: "modal-sm",
              });
              this.gameService.gameStatus = this.restService.getGameStatus();
            }, 3000);
          } else {
            this.initialized = data.msg || "Please wait...";
          }
        },
        (err) => {
          this.stopLoading();
          Swal.fire({
            title: "Opps...",
            text: err || "Something went wrong",
            icon: "error",
            confirmButtonText: "OK",
          });
          clearInterval(this._timer);
        }
      );
      seconds = seconds + 3;
      if (seconds > 90) {
        this.stopLoading();
        Swal.fire({
          title: "Opps...",
          text: "Something went wrong",
          icon: "error",
          confirmButtonText: "OK",
        });
        clearInterval(this._timer);
      }
    }, 3000);
  }

  private terminateGame(sessionId: string): void {
    Swal.fire({
      title: "Are you sure?",
      text: "You are already playing a game. Do you want to terminate it?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        this.restService.terminateGame(sessionId).subscribe(
          () => {
            setTimeout(() => {
              this.gameService.gameStatus = this.restService.getGameStatus();
              this.stopLoading();
              this.startGame();
            }, 2000);
          },
          (err) => {
            this.stopLoading();
            Swal.fire({
              title: "Opps...",
              text: err || "Something went wrong",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        );
      } else if (result.isDenied || result.isDismissed) {
        this.stopLoading();
      }
    });
  }

  private startLoading(): void {
    this.startingGame = true;
    this.loaderService.startLoader("play-loader");
  }

  private stopLoading(): void {
    this.startingGame = false;
    this.loaderService.stopLoader("play-loader");
    this._initializedModalRef?.close();
    this.initialized = "Please wait...";
  }

  private startTerminating(): void {
    this.terminatingGame = true;
    this.loaderService.startLoader("terminate-loader");
  }

  private stopTerminating(): void {
    this.terminatingGame = false;
    this.loaderService.stopLoader("terminate-loader");
  }

  private getShuffledGames(games: GameModel[]): GameModel[] {
    return [...games].sort(() => Math.random() - 0.5);
  }

  showText() {
    this.isReadMore = !this.isReadMore;
  }
}
