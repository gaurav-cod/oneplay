import { Location } from "@angular/common";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { combineLatest, merge, Subscription } from "rxjs";
import { PurchaseStore } from "src/app/interface";
import { GameModel } from "src/app/models/game.model";
import { UserModel } from "src/app/models/user.model";
import { VideoModel } from "src/app/models/video.model";
import { AuthService } from "src/app/services/auth.service";
import { GameService } from "src/app/services/game.service";
import { GamepadService } from "src/app/services/gamepad.service";
import { RestService } from "src/app/services/rest.service";
import { ToastService } from "src/app/services/toast.service";
import { environment } from "src/environments/environment";
import Swal, { SweetAlertResult } from "sweetalert2";
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
  @ViewChild("reportErrorModal") reportErrorModal: ElementRef<HTMLDivElement>;

  initialized: string = "Please Wait......";
  isReadMore = true;

  game: GameModel;
  playing: string = "";
  showAllVideos = false;
  showAllLiveVideos = false;
  startingGame = false;
  terminatingGame = false;

  similarGames: GameModel[] = [];

  loadingWishlist = false;

  constants = PlayConstants;
  allowedResolutions: string[] = [];

  resolution = new FormControl();
  fps = new FormControl();
  vsync = new FormControl();
  bitrate = new FormControl();
  action: "Play" | "Resume" = "Play";
  user: UserModel;
  sessionToTerminate = "";
  selectedStore: PurchaseStore;

  showSettings = new FormControl();

  advancedOptions = new FormGroup({
    show_stats: new FormControl(false),
    fullscreen: new FormControl(true),
    onscreen_controls: new FormControl(false),
    audio_type: new FormControl("stereo"),
    stream_codec: new FormControl("auto"),
    video_decoder_selection: new FormControl("auto"),
  });

  reportText = new FormControl("", { validators: Validators.required });

  private _devGames: GameModel[] = [];
  private _genreGames: GameModel[] = [];
  private _clientToken: string;
  private wishlist: string[] = [];
  private _initializedModalRef: NgbModalRef;
  private _settingsModalRef: NgbModalRef;
  private _launchModalRef: NgbModalRef;
  private _advancedModalRef: NgbModalRef;
  private _gamepads: Gamepad[] = [];
  private _clientTokenSubscription: Subscription;
  private _webplayTokenSubscription: Subscription;
  private _pageChangeSubscription: Subscription;
  private _gameStatusSubscription: Subscription;
  private _reportErrorModalRef: NgbModalRef;

  private videos: VideoModel[] = [];
  private liveVideos: VideoModel[] = [];
  private reportResponse: any = null;

  constructor(
    private readonly location: Location,
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly ngbModal: NgbModal,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly loaderService: NgxUiLoaderService,
    private readonly gameService: GameService,
    private readonly gamepadService: GamepadService,
    private readonly toastService: ToastService,
    private readonly router: Router
  ) {
    merge<[string, number]>(
      this.resolution.valueChanges,
      this.fps.valueChanges
    ).subscribe(() => {
      this.bitrate.setValue(
        PlayConstants.getIdleBitrate(this.resolution.value, this.fps.value)
      );
    });

    const userAgent = new UAParser();
    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = wishlist)
    );
    this.gamepadService.gamepads.subscribe((gamepads) => {
      this._gamepads = gamepads;
      if (
        gamepads.length === 0 &&
        userAgent.getOS().name === "Android" &&
        userAgent.getDevice().type !== "smarttv"
      ) {
        this.advancedOptions.controls["onscreen_controls"].setValue(true);
      } else {
        this.advancedOptions.controls["onscreen_controls"].setValue(false);
      }
    });
    this.authService.user.subscribe((user) => {
      if (user) {
        const resolution = localStorage.getItem("resolution");
        this.resolution.setValue(
          resolution ||
            (window.innerWidth < 768
              ? PlayConstants.MOBILE_RESOLUTION
              : PlayConstants.DEFAULT_RESOLUTIONS[
                  user.subscribedPlan ?? "Founder"
                ])
        );
        this.allowedResolutions =
          PlayConstants.RESOLUTIONS_PACKAGES[user.subscribedPlan ?? "Founder"];
        this.user = user;
      }
    });
    const showSettings = localStorage.getItem("showSettings");
    this.showSettings.setValue(showSettings ? showSettings === "true" : false);
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
    this._initializedModalRef?.close();
    this._settingsModalRef?.close();
    this._launchModalRef?.close();
    this._advancedModalRef?.close();
    this._clientTokenSubscription?.unsubscribe();
    this._gameStatusSubscription?.unsubscribe();
    this._pageChangeSubscription?.unsubscribe();
    this._gameStatusSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    const paramsObservable = this.route.params.pipe();
    const queryParamsObservable = this.route.queryParams.pipe();
    this._pageChangeSubscription = combineLatest(
      paramsObservable,
      queryParamsObservable
    ).subscribe((params) => {
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
            this.selectedStore = game.storesMapping[0];
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
          (err) => {
            if (err.timeout) {
              this.router.navigateByUrl("/server-error");
            }
            this.loaderService.stop();
          }
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

      this._gameStatusSubscription?.unsubscribe();

      this._gameStatusSubscription = this.gameService.gameStatus.subscribe(
        (status) => {
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
        }
      );
    });
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

  get _videos(): VideoModel[] {
    return !this.showAllVideos ? this.videos.slice(0, 2) : this.videos;
  }

  get _liveVideos(): VideoModel[] {
    return !this.showAllLiveVideos
      ? this.liveVideos.slice(0, 2)
      : this.liveVideos;
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
    const userAgent = new UAParser();
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
    const userAgent = new UAParser();
    switch (userAgent.getOS().name) {
      case "Windows":
        return "Ctrl + Alt + Shift + Q";
      case "Mac OS":
        return "Control + Option + Shift + Q";
      default:
        return "";
    }
  }

  get domain() {
    return environment.domain;
  }

  get bitrateInMb() {
    return Math.floor((this.bitrate.value ?? 0) / 1000);
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
        title: "Oops...",
        text: "Your account needs to be subjected to availability by Oneplay to play games",
        icon: "error",
      });
      return;
    }
    if (!this.user.subscriptionIsActive) {
      Swal.fire({
        title: "Oops...",
        html: !this.user.subscribedPlan
          ? `You haven't bought any subscription yet. Please visit <a href="${this.domain}/subscription.html">here</a>`
          : "Your subscription is not active. Please renew your subscription",
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
    this._advancedModalRef = this.ngbModal.open(container, {
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
          title: "Error Code: " + err.code,
          text: err.message,
          icon: "error",
        });
        this.stopTerminating();
      }
    );
  }

  clickLaunchAgain() {
    this.launchGame();
    this._launchModalRef?.close();
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

    if (this._gamepads.length > 0) {
      this.toastService.show(
        `🎮 ${this._gamepads.length} gamepads are connected`,
        { classname: "bg-gray-dark text-success", delay: 4000 }
      );
    }

    this.restService
      .startGame(
        this.game.oneplayId,
        this.resolution.value,
        this.vsync.value,
        Number(this.fps.value),
        Number(this.bitrate.value),
        this.advancedOptions.value,
        this.selectedStore
      )
      .subscribe(
        (data) => {
          if (data.data.api_action === "call_session") {
            this._initializedModalRef = this.ngbModal.open(
              this.initializedModal,
              {
                centered: true,
                modalDialogClass: "modal-sm",
                backdrop: "static",
                keyboard: false,
              }
            );
            this.sessionToTerminate = data.data.session.id;
            this.startGameWithClientToken(data.data.session.id);
          } else if (data.data.api_action === "call_terminate") {
            this.terminateGame(data.data.session.id);
          } else {
            this.stopLoading();
            Swal.fire({
              title: "Error Code: " + data.code,
              text: data.msg || "Something went wrong",
              icon: "error",
              showCancelButton: true,
              confirmButtonText: "Try Again",
              cancelButtonText: "Report Error",
            }).then((_) => this.reportErrorOrTryAgain(_, data));
          }
        },
        (err) => {
          this.stopLoading();
          Swal.fire({
            title: "Error Code: " + err.code,
            text: err.message,
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Try Again",
            cancelButtonText: "Report Error",
          }).then((_) => this.reportErrorOrTryAgain(_, err));
        }
      );
  }

  private startGameWithClientToken(sessionId: string, millis = 0): void {
    if (millis > 120000) {
      this.stopLoading();
      Swal.fire({
        title: "Oops...",
        text: "Something went wrong",
        icon: "error",
        confirmButtonText: "Try Again",
      }).then((res) => {
        if (res.isConfirmed) {
          this.startGame();
        }
      });
      return;
    }

    const startTime = new Date().getTime();

    this._clientTokenSubscription?.unsubscribe();

    this._clientTokenSubscription = this.restService
      .getClientToken(sessionId)
      .subscribe(
        (data) => {
          if (!!data.client_token) {
            this._clientToken = data.client_token;
            this.launchGame();

            setTimeout(() => {
              this.stopLoading();
              this._launchModalRef = this.ngbModal.open(this.launchModal, {
                centered: true,
                modalDialogClass: "modal-sm",
              });
              setTimeout(() => {
                this._launchModalRef?.close();
              }, 30000);
              this.gameService.gameStatus = this.restService.getGameStatus();
            }, 3000);
          } else {
            this.initialized = data.msg || "Please wait...";

            const timeTaken = new Date().getTime() - startTime;
            if (timeTaken >= 2000) {
              this.startGameWithClientToken(sessionId, timeTaken + millis);
            } else {
              setTimeout(
                () =>
                  this.startGameWithClientToken(
                    sessionId,
                    timeTaken + millis + 1000
                  ),
                1000
              );
            }
          }
        },
        (err) => {
          this.stopLoading();
          Swal.fire({
            title: "Error Code: " + err.code,
            text: err.message,
            icon: "error",
            confirmButtonText: "Relaunch the game",
          }).then((res) => {
            if (res.isConfirmed) {
              this.startGame();
            }
          });
        }
      );
  }

  startGameWithWebRTCToken(count = 0): void {
    if (count === 0) {
      this.loaderService.start();
    } else if (count > 2) {
      this.loaderService.stop();
      Swal.fire({
        title: "Oops...",
        text: "Something went wrong",
        icon: "error",
      });
      return;
    }

    const startTime = new Date().getTime();

    this._gameStatusSubscription?.unsubscribe();

    this._gameStatusSubscription = this.restService
      .getWebPlayToken(this.sessionToTerminate)
      .subscribe(
        (res) => {
          if (res.data.service === "running" && !!res.data.token) {
            this.launchWebRTC(res.data.token);
            this.loaderService.stop();
          } else {
            const timeTaken = new Date().getTime() - startTime;
            if (timeTaken >= 2000) {
              this.startGameWithWebRTCToken(count + 1);
            } else {
              setTimeout(() => this.startGameWithWebRTCToken(count + 1), 1000);
            }
          }
        },
        (err) => {
          this.loaderService.stop();
          Swal.fire({
            title: "Error Code: " + err.code,
            text: err.message,
            icon: "error",
          });
        }
      );
  }

  reportError() {
    this.restService
      .postAReport(this.reportText.value, this.reportResponse)
      .subscribe({
        next:() => {
          Swal.fire({
            icon: "success",
            title: "Reported!",
            text: "We have recieve your report. We will look into it.",
          });
        },
        error:(err) => {
          Swal.fire({
            title: "Error Code: " + err.code,
            text: err.message,
            icon: "error",
          });
        },
      });
      this.reportText.setValue('');
      this.reportResponse = null;
      this._reportErrorModalRef.close();
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
              title: "Error Code: " + err.code,
              text: err.message,
              icon: "error",
              confirmButtonText: "Try Again",
            }).then((res) => {
              if (res.isConfirmed) {
                this.terminateGame(sessionId);
              }
            });
          }
        );
      } else if (result.isDenied || result.isDismissed) {
        this.stopLoading();
      }
    });
  }

  private launchGame() {
    const userAgent = new UAParser(window.navigator.userAgent);
    if (userAgent.getOS().name === "Android") {
      window.open(
        `${this.domain}/launch/app?payload=${this._clientToken}`,
        "_blank"
      );
    } else {
      window.location.href = `oneplay:key?${this._clientToken}`;
    }
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

  private launchWebRTC(token: string) {
    window.open(
      `${environment.webrtc_domain}/?token=${token}&fps=55&resolution=&bitrate=10000`,
      "_blank"
    );
  }

  selectStore(store: PurchaseStore) {
    this.selectedStore = store;
  }

  private reportErrorOrTryAgain(result: SweetAlertResult<any>, response: any) {
    if (result.dismiss == Swal.DismissReason.cancel) {
      this.reportResponse = response;
      this._reportErrorModalRef = this.ngbModal.open(this.reportErrorModal, {
        centered: true,
        modalDialogClass: "modal-sm",
        // scrollable: true,
        // backdrop: "static",
        // keyboard: false,
      });
    } else if (result.isConfirmed) {
      this.startGame();
    }
  }
}
