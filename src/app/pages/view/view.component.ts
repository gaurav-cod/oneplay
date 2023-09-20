import { Location } from "@angular/common";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
} from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { combineLatest, lastValueFrom, merge, Subscription } from "rxjs";
import {
  ClientTokenRO,
  GameStatusRO,
  PurchaseStore,
  StartGameRO,
  WebPlayTokenRO,
} from "src/app/interface";
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
import { MediaQueries } from "src/app/utils/media-queries";
import { CountlyService } from "src/app/services/countly.service";
import { mapFPStoGamePlaySettingsPageView, mapResolutionstoGamePlaySettingsPageView, mapStreamCodecForGamePlayAdvanceSettingView } from "src/app/utils/countly.util";
// import { CustomSegments, StartEvent } from "src/app/services/countly";

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit, OnDestroy {
  // @ViewChild("initializedModal") initializedModal: ElementRef<HTMLDivElement>;
  @ViewChild("launchModal") launchModal: ElementRef<HTMLDivElement>;
  @ViewChild("reportErrorModal") reportErrorModal: ElementRef<HTMLDivElement>;
  @ViewChild("waitQueueModal") waitQueueModal: ElementRef<HTMLDivElement>;
  @ViewChild("smallModal") settingsModal: ElementRef<HTMLDivElement>;
  @ViewChild("macDownloadModal") macDownloadModal: ElementRef<HTMLDivElement>;

  initialized: string = "Loading...";
  progress: number = 0;
  isReadMore = true;

  game: GameModel;
  playing: string = "";
  showAllVideos = false;
  showAllLiveVideos = false;
  startingGame = false;
  terminatingGame = false;
  initializationPage = false;
  initializationErrored = false;
  macDownloadLink:boolean = false;

  similarGames: GameModel[] = [];

  loadingWishlist = false;

  constants = PlayConstants;

  _resolutionSub: Subscription = undefined;
  _fpsSub: Subscription = undefined;
  _vsyncSub: Subscription = undefined;
  _bitrateSub: Subscription = undefined;
  resolution = new UntypedFormControl();
  fps = new UntypedFormControl();
  vsync = new UntypedFormControl();
  bitrate = new UntypedFormControl();
  action: "Play" | "Resume" = "Play";
  user: UserModel;
  sessionToTerminate = "";
  selectedStore: PurchaseStore;

  showSettings = new UntypedFormControl();

  advancedOptions = new UntypedFormGroup({
    show_stats: new UntypedFormControl(false),
    fullscreen: new UntypedFormControl(true),
    onscreen_controls: new UntypedFormControl(false),
    audio_type: new UntypedFormControl("stereo"),
    stream_codec: new UntypedFormControl("auto"),
    video_decoder_selection: new UntypedFormControl("auto"),
  });

  reportText = new UntypedFormControl("", { validators: [Validators.required, Validators.maxLength(500)]});

  queueSequence = "";
  queueMessge1 = "";
  queueMessge2 = "";

  private _devGames: GameModel[] = [];
  private _genreGames: GameModel[] = [];
  private _clientToken: string;
  private wishlist: string[] = [];
  // private _initializedModalRef: NgbModalRef;
  private _settingsModalRef: NgbModalRef;
  private _launchModalRef: NgbModalRef;
  private _advancedModalRef: NgbModalRef;
  private _macDownloadModalRef: NgbModalRef;
  private _gamepads: Gamepad[] = [];
  private _startGameSubscription: Subscription;
  private _clientTokenSubscription: Subscription;
  private _webplayTokenSubscription: Subscription;
  private _pageChangeSubscription: Subscription;
  private _gameStatusSubscription: Subscription;
  private _getGameDetailsSub: Subscription;
  private _getGamesByDeveloperSub: Subscription;
  private _getGamesByGenreSub: Subscription;
  private _getSimilarGamesSub: Subscription;
  private _getVideosSub: Subscription;
  private _getLiveVideosSub: Subscription;
  private _reportErrorModalRef: NgbModalRef;
  private _waitQueueModalRef: NgbModalRef;
  private _launchModalCloseTimeout: NodeJS.Timeout;
  private videos: VideoModel[] = [];
  private liveVideos: VideoModel[] = [];
  private reportResponse: any = null;
  private isConnected: boolean = false;
  // private _settingsEvent: StartEvent<"gamePlay - Settings Page View">;
  // private _advanceSettingsEvent: StartEvent<"gamePlay - AdvanceSettings">;
  // private _initializeEvent: StartEvent<"gamePlay - Initilization">;

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
    private readonly router: Router,
    private readonly countlyService: CountlyService
  ) {
    const userAgent = new UAParser();

    if (MediaQueries.isMobile) {
      this.bitrate.setValue(5000);
    } else {
      merge<[string, number]>(
        this.resolution.valueChanges,
        this.fps.valueChanges
      ).subscribe(() => {
        this.bitrate.setValue(
          PlayConstants.getIdleBitrate(this.resolution.value, this.fps.value)
        );
      });
    }
    this._resolutionSub = this.resolution.valueChanges.subscribe((val) => {
      this.countlyService.updateEventData("gamePlaySettingsPageView", {
        settingsChanged: "yes",
        resolution: mapResolutionstoGamePlaySettingsPageView(val),
      })
    })
    this._fpsSub = this.fps.valueChanges.subscribe((val) => {
      this.countlyService.updateEventData("gamePlaySettingsPageView", {
        settingsChanged: "yes",
        fps: mapFPStoGamePlaySettingsPageView(val),
      })
    })
    this._vsyncSub = this.vsync.valueChanges.subscribe((val) => {
      this.countlyService.updateEventData("gamePlaySettingsPageView", {
        settingsChanged: "yes",
        vsyncEnabled: val ? "yes" : "no",
      })
    })
    this._bitrateSub = this.bitrate.valueChanges.subscribe((val) => {
      this.countlyService.updateEventData("gamePlaySettingsPageView", {
        settingsChanged: "yes",
        bitRate: val,
      })
    })

    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = (wishlist ?? []))
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
            (MediaQueries.isMobile
              ? PlayConstants.MOBILE_RESOLUTION
              : PlayConstants.DEFAULT_RESOLUTIONS["Founder"])
        );
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
    this.countlyService.endEvent("gameLandingView")
    if (this.startingGame) {
      this.stopLoading();
    }
    // this._initializedModalRef?.close();
    this._settingsModalRef?.close();
    this._launchModalRef?.close();
    this._advancedModalRef?.close();
    this._waitQueueModalRef?.close();
    this._startGameSubscription?.unsubscribe();
    this._clientTokenSubscription?.unsubscribe();
    this._gameStatusSubscription?.unsubscribe();
    this._getGameDetailsSub?.unsubscribe();
    this._pageChangeSubscription?.unsubscribe();
    this._webplayTokenSubscription?.unsubscribe();
    this._resolutionSub?.unsubscribe();
    this._fpsSub?.unsubscribe();
    this._vsyncSub?.unsubscribe();
    this._bitrateSub?.unsubscribe();
    this._getGamesByDeveloperSub?.unsubscribe();
    this._getGamesByGenreSub?.unsubscribe();
    this._getSimilarGamesSub?.unsubscribe();
    this._getVideosSub?.unsubscribe();
    this._getLiveVideosSub?.unsubscribe();
    // this._settingsEvent?.cancel();
    // this._advanceSettingsEvent?.cancel();
    // this._initializeEvent?.cancel();
    this._macDownloadModalRef?.close();
    Swal.close();
  }

  ngOnInit(): void {
    const paramsObservable = this.route.params.pipe();
    const queryParamsObservable = this.route.queryParams.pipe();
    this._pageChangeSubscription = combineLatest(
      paramsObservable,
      queryParamsObservable
    ).subscribe((params) => {
      this.game = undefined;
      const id = (params[0].id as string).replace(/(.*)\-/g, "");
      const keyword = params[1].keyword;
      const keywordHash = params[1].hash;
      this.stopLoading();
      this.loaderService.start();
      this._getGameDetailsSub?.unsubscribe();
      this._getGameDetailsSub = this.restService
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
             if (game.preferredStore) {
               const preferredStoreIndex = game.storesMapping.findIndex(
                 (store) => store.name === game.preferredStore
               );
               if (preferredStoreIndex >= 0) {
                 this.selectedStore =
                   game.storesMapping.at(preferredStoreIndex);
               } else {
                this.selectedStore = game.storesMapping[0] ?? null;
               }
             } else {
               this.selectedStore = game.storesMapping[0] ?? null;
             }
              this._getGamesByDeveloperSub?.unsubscribe();
              this._getGamesByDeveloperSub = this.restService
                .getGamesByDeveloper(game.developer.join(","))
                .subscribe(
                  (games) =>
                    (this._devGames = this.getShuffledGames([
                      ...this._devGames,
                      ...games,
                    ]))
                )
              this._getGamesByGenreSub?.unsubscribe();
              this._getGamesByGenreSub = this.restService
                .getGamesByGenre(game.genreMappings.join(","))
                .subscribe(
                  (games) =>
                    (this._genreGames = this.getShuffledGames([
                      ...this._genreGames,
                      ...games,
                    ]))
                )
            this.loaderService.stop();
            const segments = this.countlyService.getEventData("gameLandingView");
            if (segments) {
              this.countlyService.updateEventData("gameLandingView", {
                gameId: game.oneplayId,
                gameTitle: game.title,
                gameGenre: game.genreMappings.join(', '),
              });
            } else {
              this.countlyService.startEvent("gameLandingView", {
                discardOldData: false,
                data: {
                    gameId: game.oneplayId,
                    gameTitle: game.title,
                    gameGenre: game.genreMappings.join(', '),
                    source: "directLink",
                    trigger: "card",
                }
              });
            }
          },
          (err) => {
            if (err.timeout) {
              this.router.navigateByUrl("/server-error");
            }
            this.loaderService.stop();
          }
        );
      this._getSimilarGamesSub?.unsubscribe();
      this._getSimilarGamesSub = this.restService
        .getSimilarGames(id)
        .subscribe((games) => (this.similarGames = games));
      this._getVideosSub?.unsubscribe();
      this._getVideosSub = this.restService
        .getVideos(id)
        .subscribe((videos) => (this.videos = videos));
      this._getLiveVideosSub?.unsubscribe();
      this._getLiveVideosSub = this.restService
        .getLiveVideos(id)
        .subscribe((videos) => (this.liveVideos = videos));

      this._gameStatusSubscription?.unsubscribe();
      this._gameStatusSubscription = this.gameService.gameStatus.subscribe(
        (status) => this.gameStatusSuccess(status)
      );
    });
  }

  private gameStatusSuccess(status: GameStatusRO) {
    if (!this.startingGame) {
      if (status && status.game_id === this.game.oneplayId) {
        this.isConnected = status.is_user_connected;
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

  @HostListener("window:beforeunload", ["$event"])
  unloadNotification($event: any) {
    if (this.startingGame) {
      $event.returnValue = true;
    }
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
        return this.macDownloadLink = true;
      case "Android":
        return "";
      default:
        return "";
    }
  }

  macDownload(container) {
    this._macDownloadModalRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-lg",
      backdrop: "static",
      keyboard: false,
    });
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

  get shortDescLength() {
    if (screen.width >= 2438) {
      return 276;
    } else if (screen.width >= 1440) {
      return 145;
    } else if (screen.width >= 1024) {
      return 100;
    } else if (screen.width >= 768) {
      return 84;
    } else if (screen.width >= 425) {
      return 145;
    } else if (screen.width >= 375) {
      return 125;
    } else {
      return 92;
    }
  }

  get shortDesc() {
    return (
      this.game?.description
        ?.slice(0, this.shortDescLength - 1)
        .replace(/<[^>]*>|&[^;]+;/gm, "") ?? ""
    );
  }

  get longDesc() {
    return this.game?.description?.replace(/<[^>]*>|&[^;]+;/gm, "") ?? "";
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
    });
  }

  removeFromWishlist(): void {
    this.loadingWishlist = true;
    this.restService.removeWishlist(this.game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.removeFromWishlist(this.game.oneplayId);
    });
  }

  async playGame(
    container: ElementRef<HTMLDivElement>,
    skipCheckResume = false
  ) {
    const uagent = new UAParser();
    this.countlyService.endEvent("gameLandingView")
    this.countlyService.startEvent("gamePlayStart", {
      discardOldData: true,
    });

    if (
      uagent.getOS().name === "iOS" &&
      MediaQueries.isInBrowser &&
      !skipCheckResume
    ) {
      if (/safari/i.test(uagent.getBrowser().name)) {
        this.router.navigateByUrl("/install");
      } else {
        Swal.fire({
          title: "Set up on Safari",
          text: "Streaming games is not supported in this browser",
          icon: "error",
          confirmButtonText: "Close",
        });
      }
      return;
    }

    if (this.action === "Resume" && !skipCheckResume && this.isConnected) {
      const result = await Swal.fire({
        title: "Hold Up!",
        text: "Resuming your journey here? It will terminate your session from other device!",
        icon: "warning",
        confirmButtonText: "Yes",
        showCancelButton: true,
        cancelButtonText: "No",
      });
      if (!result.isConfirmed) {
        return;
      }
    }
    if (this.user.status !== "active") {
      Swal.fire({
        title: "Oops...",
        text: "Your account needs to be subjected to availability by Oneplay to play games",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }

    this.restService.getTokensUsage().subscribe((data) => {
      let swal_html = null;
      if (data.total_tokens === 0) {
        swal_html = `Level up and purchase a new subscription to continue Gaming. <p class="mt-4 "><a href="${this.domain}/subscription.html#Monthly_Plan" class="btn playBtn border-0 text-white GradientBtnPadding">Buy Now</a></p>`;
      } else if (data.total_tokens > 0 && data.remaining_tokens < 10) {
        swal_html = `Minimum 10 mins required for gameplay. Renew your subscription now!<p class="mt-4 "><a href="${this.domain}/subscription.html#Hourly_Plan" class="btn playBtn border-0 text-white GradientBtnPadding">Buy Now</a></p>`;
      } else {
        if (this.showSettings.value) {
          this.countlyService.startEvent("gamePlaySettingsPageView", {
            discardOldData: true,
            data: {
              gameTitle: this.game.title,
              gameId: this.game.oneplayId,
              gameGenre: this.game.genreMappings.join(', '),
              store: this.selectedStore?.name,
              advanceSettingsViewed: 'no',
              settingsChanged: 'no',
              bitRate: this.bitrate.value,
              vsyncEnabled: this.vsync.value ? "yes" : "no",
              resolution: mapResolutionstoGamePlaySettingsPageView(this.resolution.value),
              fps: mapFPStoGamePlaySettingsPageView(this.fps.value),
            }
          })
          this._settingsModalRef = this.ngbModal.open(container, {
            centered: true,
            modalDialogClass: "modal-md",
            backdrop: "static",
            keyboard: false,
          });
        } else {
          this.startGame();
        }
      }
      if (swal_html != null) {
        Swal.fire({
          imageUrl: "assets/img/swal-icon/Recharge-Subscription.svg",
          customClass: "swalPaddingTop",
          title: "Wait!",
          html: swal_html,
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    });
  }

  openAdvanceOptions(container): void {
    this._advancedModalRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
    });
    this.countlyService.updateEventData("gamePlaySettingsPageView", {
      advanceSettingsViewed: 'yes',
    })
    this.countlyService.startEvent("gamePlayAdvanceSettingView", {
      data: {
        gameTitle: this.game.title,
        gameId: this.game.oneplayId,
        gameGenre: this.game.genreMappings.join(', '),
        store: this.selectedStore?.name,
        settingsChanged: 'no',
      }
    })
    this._advancedModalRef.dismissed.subscribe(() => {
      const advancedOptions = localStorage.getItem("advancedOptions");
      if (advancedOptions) {
        this.advancedOptions.setValue(JSON.parse(advancedOptions));
      } else {
        this.advancedOptions.reset();
      }
      this.countlyService.endEvent("gamePlayAdvanceSettingView", {
        settingsChanged: "no",
        gameTitle: this.game.title,
        gameId: this.game.oneplayId,
        gameGenre: this.game.genreMappings.join(', '),
        store: this.selectedStore?.name,
        showStatsEnabled: this.advancedOptions.value.show_stats ? "yes" : "no",
        fullscreenEnabled: this.advancedOptions.value.fullscreen ? "yes" : "no",
        onscreenControlsEnabled: this.advancedOptions.value.onscreen_controls ? "yes" : "no",
        audioType: this.advancedOptions.value.audio_type === "stereo" ? "stereo" : "5.1",
        streamCodec: mapStreamCodecForGamePlayAdvanceSettingView(this.advancedOptions.value.stream_codec),
        videoDecoderSelection: this.advancedOptions.value.video_decoder_selection,
      });
    });
  }

  saveAdvanceSettings(): void {
    this.countlyService.endEvent("gamePlayAdvanceSettingView", {
      settingsChanged: this.advancedOptions.dirty ? "yes" : "no",
      showStatsEnabled: this.advancedOptions.value.show_stats ? "yes" : "no",
      fullscreenEnabled: this.advancedOptions.value.fullscreen ? "yes" : "no",
      onscreenControlsEnabled: this.advancedOptions.value.onscreen_controls ? "yes" : "no",
      audioType: this.advancedOptions.value.audio_type === "stereo" ? "stereo" : "5.1",
      streamCodec: mapStreamCodecForGamePlayAdvanceSettingView(this.advancedOptions.value.stream_codec),
      videoDecoderSelection: this.advancedOptions.value.video_decoder_selection,
    });

    localStorage.setItem(
      "advancedOptions",
      JSON.stringify(this.advancedOptions.value)
    );

    this._advancedModalRef.close();
  }

  terminateSession(): void {
    this.startTerminating();
    this.restService.terminateGame(this.sessionToTerminate).subscribe(
      () => {
        Swal.fire({
          title: "Session terminated",
          text: "Your session has been terminated",
          icon: "success",
          confirmButtonText: "Okay",
        }).then(() => {
          this.countlyService.startEvent("gameFeedback", {
              data: {
                gameSessionId: this.sessionToTerminate,
                gameId: this.game.oneplayId,
                gameTitle: this.game.title,
                gameGenre: this.game.genreMappings.join(', '),
                store: this.selectedStore.name,
              }
            });
          this.router.navigate(["/quit"], {
            queryParams: {
              session_id: this.sessionToTerminate,
              game_id: this.game.oneplayId,
            },
          });
        });
        this.gameService.gameStatus = this.restService.getGameStatus();
        this.stopTerminating();
      },
      (err) => {
        Swal.fire({
          title: err.message + " Error Code: " + err.code,
          imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
          customClass: "swalPaddingTop",
          confirmButtonText: "Okay",
        });
        this.stopTerminating();
      }
    );
  }

  terminateButton() {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      html: `The Game session will terminate!`,
      confirmButtonText: "Yes",
      showDenyButton: true,
      showCloseButton: true,
      denyButtonText: "Resume",
    }).then((result) => {
      if (result.isConfirmed) {
        this.terminateSession();
      } else if (result.isDenied) {
        this.playGame(this.settingsModal, true);
      }
    });
  }

  clickLaunchAgain() {
    this.launchGame();
    this._launchModalRef?.close();
  }

  launchFromSettings() {
    this.countlyService.endEvent("gamePlaySettingsPageView");

    localStorage.setItem("resolution", this.resolution.value);
    localStorage.setItem("fps", this.fps.value);
    localStorage.setItem("vsync", this.vsync.value);

    this._settingsModalRef?.close();
    this.startGame();
  }

  dismissSettingsModal() {
    this.countlyService.cancelEvent("gamePlaySettingsPageView");
    this._settingsModalRef?.dismiss();
  }

  startGame(): void {
    if (this.startingGame) {
      return;
    }

    this.startLoading();

    if (this._gamepads.length > 0) {
      this.toastService.show(
        `🎮 ${this._gamepads.length} gamepads are connected`,
        { classname: "bg-gray-dark text-success", delay: 4000 }
      );
    }

    this.startSession();
  }

  private startSession() {
    this._startGameSubscription?.unsubscribe();
    this._startGameSubscription = this.restService
      .startGame(
        this.game.oneplayId,
        this.resolution.value,
        this.vsync.value,
        Number(this.fps.value),
        Number(this.bitrate.value),
        this.advancedOptions.value,
        this.selectedStore
      )
      .subscribe({
        next: (data) => this.startSessionSuccess(data),
        error: (err) => this.startSessionFailed(err),
      });
  }

  private endGamePlayStartEvent(
    result: "success" | "failure" | "wait",
    gameSessionId?: string
  ) {
    this.countlyService.endEvent("gamePlayStart", {
      gameSessionId,
      gameTitle: this.game.title,
      store: this.selectedStore.name,
      gameId: this.game.oneplayId,
      gameGenre: this.game.genreMappings.join(', '),
      showSettingsEnabled: this.showSettings.value ? "yes" : "no",
      result,
    })
  }

  private startSessionSuccess(data: StartGameRO) {
    this.endGamePlayStartEvent("success", data.data.session?.id);
    if (!!this._waitQueueModalRef) {
      this._waitQueueModalRef.close();
      this._waitQueueModalRef = undefined;
    }
    if (data.data.api_action === "call_session") {
      // this._initializedModalRef = this.ngbModal.open(this.initializedModal, {
      //   centered: true,
      //   modalDialogClass: "modal-sm",
      //   backdrop: "static",
      //   keyboard: false,
      // });
      this.initializationPage = true;
      this.sessionToTerminate = data.data.session.id;
      this.startGameWithClientToken(data.data.session.id);
    } else if (data.data.api_action === "call_terminate") {
      this.terminateGame(data.data.session.id);
    } else {
      // this._initializeEvent?.end({ result: "failure" });
      this.stopLoading();
      Swal.fire({
        title: "No server available!",
        text: "Please try again in sometime, thank you for your patience!",
        imageUrl: "assets/img/swal-icon/Gaming-issue.svg",
        customClass: "swalPaddingTop",
        showCancelButton: true,
        confirmButtonText: "Try Again",
        cancelButtonText: "Close",
      }).then((result) => {
        if (result.isConfirmed) {
          this.startGame();
        }
      });
    }
  }

  private startSessionFailed(err: any) {
    if (!!this._waitQueueModalRef && err.code != 801) {
      this._waitQueueModalRef.close();
      this._waitQueueModalRef = undefined;
    }

    if (err.code == 801) {
      this.endGamePlayStartEvent("wait");
      this.waitQueue(err.message);
    } else if (
      err.code == 610 ||
      err.message == "Your 4 hours per day max Gaming Quota has been exhausted."
    ) {
      this.endGamePlayStartEvent("failure");
      this.stopLoading();
      Swal.fire({
        title: "Alert!",
        text: "You have reached your daily gameplay quota of 4 hrs. See you again tomorrow!",
        imageUrl: "assets/img/error/time_limit 1.svg",
        customClass: "swalPaddingTop",
        confirmButtonText: "Okay",
      });
    } else {
      this.endGamePlayStartEvent("failure");
      this.stopLoading();
      Swal.fire({
        title: err.message + " Error Code: " + err.code,
        imageUrl: "assets/img/swal-icon/Gaming-issue.svg",
        customClass: "swalPaddingTop",
        confirmButtonText: "Okay",
      });
    }
  }

  private queueStartSessionTimeout: NodeJS.Timeout;

  private async waitQueue(message: string) {
    [this.queueSequence, this.queueMessge1, this.queueMessge2] =
      message.split(";");

    if (!this._waitQueueModalRef) {
      // this._initializeEvent?.end({ result: "wait" });
      this._waitQueueModalRef = this.ngbModal.open(this.waitQueueModal, {
        centered: true,
        modalDialogClass: "modal-sm",
        scrollable: true,
        backdrop: "static",
        keyboard: false,
      });
    }

    this.queueStartSessionTimeout = setTimeout(() => this.startSession(), 3000);
  }

  public cancelWaitQueue() {
    clearTimeout(this.queueStartSessionTimeout);
    this._waitQueueModalRef?.close();
    this._waitQueueModalRef = undefined;
    this.stopLoading();
  }

  private startGameWithClientToken(sessionId: string, millis = 0): void {
    if (millis > 120000) {
      // this._initializeEvent?.end({ result: "failure" });
      this.stopLoading();
      this.initializationErrored = true;
      Swal.fire({
        title: "Oops! Something went wrong",
        imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
        customClass: "swalPaddingTop",
        confirmButtonText: "Okay",
      }).then((res) => {
        this.stopLoading();
        this.initializationErrored = false;
        if (res.isConfirmed) {
          this.startGame();
        }
      });
      return;
    }

    const startTime = Date.now();

    this._clientTokenSubscription?.unsubscribe();

    this._clientTokenSubscription = this.restService
      .getClientToken(sessionId)
      .subscribe({
        next: (data) =>
          this.startGameWithClientTokenSuccess(
            data,
            startTime,
            sessionId,
            millis
          ),
        error: (err) => this.startGameWithClientTokenFailed(err),
      });
  }

  private startGameWithClientTokenSuccess(
    data: ClientTokenRO,
    startTime: number,
    sessionId: string,
    millis: number
  ) {
    if (!!data.client_token) {
      this.progress = 100;
      this._clientToken = data.client_token;
      const launchedFrom = this.action === "Play" ? "Play now" : "Resume";
      lastValueFrom(this.restService.getGameStatus())
        .then((status) => {
          this.stopLoading();
          this.gameStatusSuccess(status);
        })
        .catch(() => {
          this.stopLoading();
        })
        .finally(() => {
          if (MediaQueries.isAddedToHomeScreen) {
            this.startGameWithWebRTCToken();
          } else {
            // this._initializeEvent?.end({ result: "success" });
            // this.countlyService.startEvent("gameLaunch", {
            //   data: {
            //     gameID: this.game.oneplayId,
            //     gameTitle: this.game.title,
            //     gameGenre: this.game.genreMappings?.join(","),
            //     from: launchedFrom,
            //     gamesessionid: sessionId,
            //   },
            // });
            this.launchGame();
            this._launchModalRef = this.ngbModal.open(this.launchModal, {
              centered: true,
              modalDialogClass: "modal-md",
            });
            this._launchModalCloseTimeout = setTimeout(() => {
              this._launchModalRef?.close();
            }, 30000);
          }
        });
    } else {
      this.initialized = data.msg || "Loading...";
      this.progress = data.progress;

      const timeTaken = Date.now() - startTime;
      if (timeTaken >= 2000) {
        this.startGameWithClientToken(sessionId, timeTaken + millis);
      } else {
        const delay = 2000 - timeTaken;
        setTimeout(
          () =>
            this.startGameWithClientToken(
              sessionId,
              timeTaken + millis + delay
            ),
          delay
        );
      }
    }
  }

  private startGameWithClientTokenFailed(err: any) {
    // this._initializeEvent?.end({ result: "failure" });
    this.stopLoading();
    this.initializationErrored = true;
    Swal.fire({
      title: err.message + " Error Code: " + err.code,
      imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
      customClass: "swalPaddingTop",
      confirmButtonText: "Try Again",
      showCancelButton: true,
      cancelButtonText: "Report",
    }).then((res) => {
      this.stopLoading();
      this.initializationErrored = false;
      this.reportErrorOrTryAgain(res, err);
    });
  }

  startGameWithWebRTCToken(millis = 0): void {
    if (!environment.webrtc_prefix) {
      Swal.fire({
        icon: "error",
        title: "Web-Play",
        text: "Play on web is coming soon!",
        confirmButtonText: "Okay",
      });
      return;
    }

    if (this._launchModalCloseTimeout !== undefined) {
      clearTimeout(this._launchModalCloseTimeout);
      this._launchModalCloseTimeout = undefined;
    }

    if (millis === 0) {
      this.loaderService.start();
    } else if (millis > 60000) {
      this.loaderService.stop();
      Swal.fire({
        title: "Oops! Something went wrong",
        imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
        customClass: "swalPaddingTop",
        confirmButtonText: "Okay",
      });
      return;
    }

    const startTime = Date.now();

    this._webplayTokenSubscription?.unsubscribe();

    this._webplayTokenSubscription = this.restService
      .getWebPlayToken(this.sessionToTerminate)
      .subscribe({
        next: (res) =>
          this.startGameWithWebRTCTokenSuccess(res, startTime, millis),
        error: (err) => this.startGameWithWebRTCTokenFailed(err),
      });
  }

  private startGameWithWebRTCTokenSuccess(
    res: WebPlayTokenRO,
    startTime: number,
    millis: number
  ) {
    if (res.data.service === "running" && !!res.data.web_url) {
      const url = new URL(environment.webrtc_prefix);
      const device = new UAParser().getDevice().type ?? "";

      url.searchParams.set("title", this.game.title);
      url.searchParams.set("bitrate", this.bitrate.value);
      url.searchParams.set("fps", this.fps.value);
      url.searchParams.set(
        "show_stats",
        this.advancedOptions.controls["show_stats"].value
      );
      url.searchParams.set(
        "platform",
        /mobile|tablet/i.test(device) ? "mobile" : "desktop"
      );

      window.open(url.href + "&" + res.data.web_url.replace(/\?/, ""), "_self");

      this.loaderService.stop();
    } else {
      const timeTaken = Date.now() - startTime;
      if (timeTaken >= 2000) {
        this.startGameWithWebRTCToken(timeTaken + millis);
      } else {
        const delay = 2000 - timeTaken;
        setTimeout(
          () => this.startGameWithWebRTCToken(timeTaken + millis + delay),
          delay
        );
      }
    }
  }

  private startGameWithWebRTCTokenFailed(err: any) {
    this.loaderService.stop();
    Swal.fire({
      title: "Error Code: " + err.code,
      text: err.message,
      imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
      customClass: "swalPaddingTop",
      confirmButtonText: "Try Again",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        this.startGameWithWebRTCToken();
      }
    });
  }

  reportError() {
    this.restService
      .postAReport(this.reportText.value, this.reportResponse, this.reportResponse.error_code)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: "success",
            title: "Reported!",
            text: "We have recieve your report. We will look into it.",
          });
        },
        error: (err) => {
          Swal.fire({
            title: err.message + " Error Code: " + err.code,
            imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
            customClass: "swalPaddingTop",
            confirmButtonText: "Okay",
          });
        },
      });
    this.reportText.setValue("");
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
              this.startSession();
            }, 2000);
          },
          (err) => {
            Swal.fire({
              title: err.message + " Error Code: " + err.code,
              imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
              customClass: "swalPaddingTop",
              confirmButtonText: "Try Again",
              showCancelButton: true,
              cancelButtonText: "Okay"
            }).then((res) => {
              if (res.isConfirmed) {
                this.terminateGame(sessionId);
              } else {
                // this._initializeEvent?.end({ result: "failure" });
                this.stopLoading();
              }
            });
          }
        );
      } else {
        // this._initializeEvent?.end({ result: "failure" });
        this.stopLoading();
      }
    });
  }

  private launchGame() {
    const userAgent = new UAParser();
    if (userAgent.getOS().name === "Android") {
      this.router.navigate(['/play'], {
        queryParams: {
          payload: this._clientToken,
          session: this.sessionToTerminate
        }
      })
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
    // this._initializedModalRef?.close();
    this.initializationPage = false;
    this.initialized = "Loading...";
    this.progress = 0;
    this._startGameSubscription?.unsubscribe();
    this._clientTokenSubscription?.unsubscribe();
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

  selectStore(store: PurchaseStore) {
    if (!this.selectedStore || this.selectedStore.name !== store.name) {
      this.selectedStore = store;
      lastValueFrom(
        this.restService.setPreferredStoreForGame(
          this.game.oneplayId,
          store.name
        )
      );
    }
  }

  private reportErrorOrTryAgain(result: SweetAlertResult<any>, response: any) {
    if (result.dismiss == Swal.DismissReason.cancel) {
      this.reportResponse = response;
      this._reportErrorModalRef = this.ngbModal.open(this.reportErrorModal, {
        centered: true,
        windowClass: "blurBG",
        modalDialogClass: "modal-sm",
      });
    } else if (result.isConfirmed) {
      this.startGame();
    }
  }
}
