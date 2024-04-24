import { Location } from "@angular/common";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
  ContentChild,
  AfterViewInit,
} from "@angular/core";
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateParserFormatter, NgbDateStruct, NgbDatepicker, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
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
import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
import { UAParser } from "ua-parser-js";
import { PlayConstants } from "./play-constants";
import { MediaQueries } from "src/app/utils/media-queries";
import { CountlyService } from "src/app/services/countly.service";
import { mapFPStoGamePlaySettingsPageView, mapResolutionstoGamePlaySettingsPageView, mapStreamCodecForGamePlayAdvanceSettingView } from "src/app/utils/countly.util";
import { TransformMessageModel } from "src/app/models/tansformMessage.model";
import { CustomDateParserFormatter } from "src/app/utils/dateparse.util";
import { platform } from "os";
import { streamConfig } from "src/app/models/streamConfig.model";
import { UserAgentUtil } from "src/app/utils/uagent.util";
// import { CustomSegments, StartEvent } from "src/app/services/countly";

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }]
})
export class ViewComponent implements OnInit, OnDestroy {
  // @ViewChild("initializedModal") initializedModal: ElementRef<HTMLDivElement>;
  @ViewChild("launchModal") launchModal: ElementRef<HTMLDivElement>;
  @ViewChild("reportErrorModal") reportErrorModal: ElementRef<HTMLDivElement>;
  @ViewChild("waitQueueModal") waitQueueModal: ElementRef<HTMLDivElement>;
  @ViewChild("smallModal") settingsModal: ElementRef<HTMLDivElement>;
  @ViewChild("macDownloadModal") macDownloadModal: ElementRef<HTMLDivElement>;
  @ViewChild("termsConditionModal") termsConditionModal: ElementRef<HTMLDivElement>;

  @ContentChild(NgbDatepicker) dobPicker: NgbDatepicker;

  public isWarningMessageView: boolean = false;

  initialized: string = "Please wait...";
  progress: number = 0;
  isReadMore = true;

  showOnboardingPopup: boolean = false;

  game: GameModel;
  playing: string = "";
  showAllVideos = false;
  showAllLiveVideos = false;
  startingGame = false;
  terminatingGame = false;
  initializationPage = false;
  initializationErrored = false;
  waring_message_display: boolean = true;

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

  gameMetaDetails: any;
  errorMessage: string | null = null;

  streamConfigList: streamConfig[] = [];
  currentStreamConfigList: streamConfig[] = [];
  selectedStreamConfig: number = null;
  isAnyValueStreamUpdated: boolean = false;
  canShowSuccessMsg: boolean = false;

  addCustomToStreamConfig() {
    let customCount = 0;
    this.streamConfigList.forEach((s)=> {
      if (s.isCustom)
        customCount++;
    })
    if (customCount == 3)
      return;

    return new streamConfig({
      "is_custom": "true",
      "service_name": "",
    })
  }

  resetStreamConfigValues() {
    this.selectedStreamConfig = null;
    this.streamConfigList.forEach((s)=> {
      s.isClicked = false;
      s.showPassword = false;
    })
  }

  showSettings = new UntypedFormControl();

  advancedOptions = new UntypedFormGroup({
    show_stats: new UntypedFormControl(false),
    fullscreen: new UntypedFormControl(true),
    onscreen_controls: new UntypedFormControl(false),
    audio_type: new UntypedFormControl("stereo"),
    stream_codec: new UntypedFormControl("auto"),
    video_decoder_selection: new UntypedFormControl("auto"),
  });
  dob = new UntypedFormControl("");

  reportText = new UntypedFormControl("", { validators: [Validators.required, Validators.maxLength(500)] });

  queueSequence = "";
  queueMessge1 = "";
  queueMessge2 = "";

  public streamErrorMsg: string = null;

  private _devGames: GameModel[] = [];
  private _genreGames: GameModel[] = [];
  private _clientToken: string;
  private wishlist: string[] = [];
  // private _initializedModalRef: NgbModalRef;
  private _settingsModalRef: NgbModalRef;
  private _launchModalRef: NgbModalRef;
  private _termConditionModalRef: NgbModalRef;
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
  private _triggerPlayGameRef: Subscription;
  private _getVideosSub: Subscription;
  private _getLiveVideosSub: Subscription;
  private _reportErrorModalRef: NgbModalRef;
  private _waitQueueModalRef: NgbModalRef;
  private _launchModalCloseTimeout: NodeJS.Timeout;
  private _userInfoContainerRef: NgbModalRef;
  private _streamDialogRef: NgbModalRef;
  private videos: VideoModel[] = [];
  private liveVideos: VideoModel[] = [];
  private reportResponse: any = null;
  private isConnected: boolean = false;
  // private _settingsEvent: StartEvent<"gamePlay - Settings Page View">;
  // private _advanceSettingsEvent: StartEvent<"gamePlay - AdvanceSettings">;
  // private _initializeEvent: StartEvent<"gamePlay - Initilization">;

  private _gameErrorHandling = PlayConstants.GAMEPLAY_ERROR_REPLAY;
  private isUserLogedIn: boolean = false;

  @ViewChild("UserInfoContainer") userInfoContainer;
  
  get isClientSide() {
    return (UserAgentUtil.parse().app === "Oneplay App");
  }

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

    this.authService.sessionTokenExists.subscribe((response)=> {
      this.isUserLogedIn = response;
    });

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
    this._termConditionModalRef?.close();
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
    this._triggerPlayGameRef?.unsubscribe();
    // this._settingsEvent?.cancel();
    // this._advanceSettingsEvent?.cancel();
    // this._initializeEvent?.cancel();
    this._macDownloadModalRef?.close();
    this._userInfoContainerRef?.close();
    this._streamDialogRef?.close();
    Swal.close();
  }


  ngOnInit(): void {
    
    if (this.isUserLogedIn) {
      this.restService.getGameStatus()
        .toPromise()
        .then(data => this.gameService.setGameStatus(data));
    }
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
            this.title.setTitle("Play " + game.title + " on OnePlay" + (game.isFree ? " for Free" : "") +" | Cloud Gaming");
            this.meta.updateTag({ name: "keywords", content: game.title + " play," + game.title + " cloud gaming," + game.title + " play on android," + game.title + " on " + game.storesMapping.map((s)=> (s.name + ",")) + " " + game.title + " cloud gaming" + (game.isFree ? " for free" : "") });
            this.meta.updateTag({ name: "description", content: "Play " + game.title + (game.isFree ? " for Free" : "") + " on OnePlay Cloud Gaming. " + game.description });
            this.meta.updateTag({ name: "og:description", content: "Play " + game.title + (game.isFree ? " for Free" : "") + " on OnePlay Cloud Gaming. " + game.description });

            if (game.preferredStore) {
              const preferredStoreIndex = game.storesMapping.findIndex(
                (store) => store.name === game.preferredStore
              );
              if (preferredStoreIndex >= 0) {
                this.selectedStore =
                  game.storesMapping[preferredStoreIndex];
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
                  ...games,
                ]))
              )
            this._getGamesByGenreSub?.unsubscribe();
            this._getGamesByGenreSub = this.restService
              .getGamesByGenre(game.genreMappings.join(","))
              .subscribe(
                (games) =>
                (this._genreGames = this.getShuffledGames([
                  // ...this._genreGames,
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
                userType: this.user ? "registered" : "guest"
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
                  userType: this.user ? "registered" : "guest"
                }
              });
            }
          },
          (error) => {
            if (error.timeout) {
              this.router.navigateByUrl("/server-error");
            } else {
              this.showError(error);
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
      if (status && status.game_id === this.game?.oneplayId) {
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

  private toggleWarning() {
    event.stopPropagation();
    this.waring_message_display = !this.waring_message_display;
  }

  private hideWarning(event: Event) {
    this.waring_message_display = true;
  }

  private dateToNgbDate = (date: Date): NgbDateStruct => ({
    year: date.getUTCFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });

  private dateMinusYears = (date: Date, count: number): Date => {
    date.setUTCFullYear(date.getUTCFullYear() - count);
    return date;
  };

  minDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 100));
  maxDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 13));
  
  get dateOfBirthErrored() {
    const control = this.dob;
    return (control.touched || control.dirty) && control.invalid;
  }
  get dobBtnDisabled() {
    const control = this.dob;
    return control.value ? ((control.touched || control.dirty) && control.invalid) : true;
  }

  @HostListener("window:beforeunload", ["$event"])
  unloadNotification($event: any) {
    if (this.startingGame) {
      $event.returnValue = true;
    }
  }

  @HostListener("window:click", ["$event"])
  click($event: any) {
    if (this.isWarningMessageView)
      this.isWarningMessageView = false;
  }

  get bgBannerImage(): string {
    return !!this.game 
      ? (this.game.isInstallAndPlay 
        ? (window.innerWidth > 475 
          ? ( window.innerWidth < 1200 
            ? this.game.installPlayDetailImgTab
            : this.game.installPlayDetailImg) 
          : this.game.installPlayDetailImgMob) 
        : (window.innerWidth > 475 ? this.game.poster_hero_banner_16_9 : this.game.poster_hero_banner_1_1))
      : null;
  }

  get bgBannerHash(): string {
    return !!this.game
      ? (this.game.isInstallAndPlay ? this.game.iapBgHash : JSON.parse(window.innerWidth > 475 ? this.game.poster_hero_banner_16_9_blurhash : this.game.poster_hero_banner_1_1_blurhash)?.blurhash)
      : null;
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
        return "macos";
      default:
        return "";
    }
  }
  
  get macDownloadLink() {
    return this.clientDownloadLink === "macos";
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

  get canAddCustomConfig() {
    return 
  }

  get shortDescLength() {
    if (window.innerWidth >= 2438) {
      return 200;
    } else if (window.innerWidth >= 1440) {
      return 105;
    } else if (window.innerWidth >= 1024) {
      return 70;
    } else if (window.innerWidth >= 768) {
      return 57;
    } else if (window.innerWidth >= 576) {
      return 100;
    } else if (window.innerWidth >= 425) {
      return 75;
    } else if (window.innerWidth >= 360) {
      return 55;
    } else {
      return 40;
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
  closeTermConditionModal() {
    this._termConditionModalRef?.close();
  }

  back(): void {
    this.location.back();
  }

  addToWishlist(): void {
    this.loadingWishlist = true;
    this.restService.addWishlist(this.game.oneplayId).subscribe((response) => {
      this.loadingWishlist = false;
      this.showSuccess(new TransformMessageModel(response.data));
      this.authService.addToWishlist(this.game.oneplayId);
    }, (error)=> {
      this.showError(error);
    });
  }

  removeFromWishlist(): void {
    this.loadingWishlist = true;
    this.restService.removeWishlist(this.game.oneplayId).subscribe((response) => {
      this.loadingWishlist = false;
      this.authService.removeFromWishlist(this.game.oneplayId);
      this.showSuccess(new TransformMessageModel(response.data));
    }, (error)=> {
      this.showError(error);
    });
  }

  installAndPlaySession(container: ElementRef<HTMLDivElement>) {

    Swal.fire({
      imageUrl: "assets/icons/oneplay-console-icon.svg",
      title: "Wait",
      text: "Do you agree to install & play this game?",
      confirmButtonText: "Yes",
      showCancelButton: true,
      cancelButtonText: "No"
    }).then((respons: any) => {
      if (respons.isConfirmed) {
        this.restService
          .getTermsConditionForGame(
            this.game.oneplayId,
            this.selectedStore
          )
          .subscribe({
            next: (data) => {

              this.gameMetaDetails = data.data;
              this._termConditionModalRef = this.ngbModal.open(container, {
                centered: true,
                modalDialogClass: "modal-md",
                backdrop: "static",
                keyboard: false,
              });
            },
            error: (err) => {
              // need to verify the message to show
              // Swal.fire({
              //   title: "Set up on Safari",
              //   text: "Streaming games is not supported in this browser",
              //   icon: "error",
              //   confirmButtonText: "Close",
              // });
            },
          });

      } else {

      }
    });
    return;

  }

  startInstallAndPlay(container: ElementRef<HTMLDivElement>) {

    this._termConditionModalRef?.close();
    this.gamePlaySettingModal(container);
  }

  async playGame(
    container: ElementRef<HTMLDivElement>,
    skipCheckResume = false,
    termConditionModal: ElementRef<HTMLDivElement> = null
  ) {

     if (localStorage.getItem("#onboardingUser") !== "true" && this.user) {
      this.showOnboardingPopup = true;
      localStorage.setItem("#canOpenOnboarding", "true");
      this._triggerPlayGameRef = this.authService.triggerPlayGame.subscribe((value)=> {
        if (value)
          this.playGame(container, skipCheckResume, termConditionModal);
      })
      return;
    }

    if (!this.isUserLogedIn) {
      this.goToSignUpPage();
      return;
    }

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
      let showSwal = false;
      let onConfirm = () => {
        window.location.href = `${environment.domain}/subscription.html`;
      };
      const swalConf: SweetAlertOptions = {
        imageUrl: "assets/img/swal-icon/Recharge-Subscription.svg",
        customClass: "swalPaddingTop",
        title: "Wait!",
        html: '',
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Buy Now",
      };
      if (data.total_tokens === 0) {
        showSwal = true;
        swalConf.html = `Level up and purchase a new subscription to continue Gaming.`;
      } else if (data.total_tokens > 0 && data.remaining_tokens < 10) {
        showSwal = true;
        swalConf.html = `Minimum 10 mins required for gameplay. Renew your subscription now!`;
        } else if ((data.total_daily_tokens - data.used_daily_tokens) <= 0){ 
        showSwal = true;
        swalConf.html = "You have reached your daily gameplay limit of "+ (Math.round(data.total_daily_tokens / 60)) + " hours. See you again tomorrow!";
        swalConf.title = "Alert!";
        swalConf.imageUrl = `assets/img/error/time_limit 1.svg`;
        swalConf.confirmButtonText = "Okay";
        swalConf.showCancelButton = false;
        onConfirm = () => {};
      } else {
        if (!this.user.dob) {
          this._userInfoContainerRef = this.ngbModal.open(this.userInfoContainer, {
            centered: true,
            modalDialogClass: "modal-md",
            backdrop: "static",
            keyboard: false,
          });
          return;
        } else {
          if (this.game.isInstallAndPlay && this.action === "Play") {
            this.installAndPlaySession(termConditionModal);
          } else if (this.showSettings.value || this.game.isInstallAndPlay) {
            this.gamePlaySettingModal(container);
          } else {
            this.canStartGame();
          }
        }
      }
      if (showSwal) {
        Swal.fire(swalConf).then((res) => {
          if (res.isConfirmed) {
            onConfirm();
          }
        });
      }
    }, (error)=> {
        // if (this._gameErrorHandling.clientTokenCount) {
        //   this._gameErrorHandling.clientTokenCount--;
        // } else {
        //   this.showError(error);
        // }
    });
  }

  private gamePlaySettingModal(container: ElementRef<HTMLDivElement>) {
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
      (res) => {
        this.countlyService.addEvent("gameTerminate", {
          gameSessionId: this.sessionToTerminate,
          gameId: this.game.oneplayId,
          gameTitle: this.game.title,
          gameGenre: this.game.genreMappings.join(', '),
          store: this.selectedStore.name,
          terminationType: "userInitiated",
          sessionDuration: res.data.session_duration,
          playDuration: res.data.play_duration,
          idleDuration: res.data.idle_duration,
        });
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
        this.restService.getGameStatus()
          .toPromise()
          .then(data => this.gameService.setGameStatus(data));
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
    this.canStartGame();
  }

  dismissSettingsModal() {
    this.countlyService.cancelEvent("gamePlaySettingsPageView");
    this._settingsModalRef?.dismiss();
  }

  canStartGame() {
    this.restService.canStartGame().subscribe((response)=> {
      this.startGame();
    }, (error)=> {
      this.showError(error);
    })
  }

  startGame(isDOBPresent: boolean = false): void {

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
    } else {
      if (this._gameErrorHandling.sessionCount) {
        this._gameErrorHandling.sessionCount--;
        this.startSession();
      } else {
        this.endGamePlayStartEvent("failure");
        this.stopLoading();
        Swal.fire({
          title: "Alert!",
          text: err.message,
          imageUrl: `assets/img/${err.code == 610 ? 'error/time_limit 1' : 'swal-icon/Gaming-issue'}.svg`,
          customClass: "swalPaddingTop",
          confirmButtonText: "Okay",
        });
      }
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

    this.queueStartSessionTimeout = setTimeout(() => this.startSession(), 10000);
  }

  public toggleWarningMessage(event) {
    this.isWarningMessageView = !this.isWarningMessageView;
    event.stopPropagation();
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
        error: (err) => this.startGameWithClientTokenFailed(err, sessionId),
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
      this.restService.getGameStatus()
        .toPromise()
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
      this.initialized = data.msg || "Please wait...";
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

  private startGameWithClientTokenFailed(err: any, sessionId: string) {
    // this._initializeEvent?.end({ result: "failure" });
    if (this._gameErrorHandling.clientTokenCount && err.code != 706 && err.code != 723) {
      this._gameErrorHandling.clientTokenCount--;
      this.startGameWithClientToken(sessionId);
    } else {
      this.stopLoading();
      this.initializationErrored = true;
      // this.showError(err, true);
      Swal.fire({
        title: err.message + " Error Code: " + err.code,
        imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
        customClass: "swalPaddingTop",
        confirmButtonText: "Try Again",
        showCancelButton: true,
        cancelButtonText: "Report",
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((res) => {
        this.stopLoading();
        this.initializationErrored = false;
        this.reportErrorOrTryAgain(res, err);
      });
    }
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
    if (this._gameErrorHandling.clientTokenCount) {
      this._gameErrorHandling.clientTokenCount--;
      this.startGameWithWebRTCToken();
    } else {
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
  }

  reportError() {
    this.restService
      .postAReport(this.reportText.value, this.reportResponse, String(this.reportResponse.code))
      .subscribe({
        next: () => {
          Swal.fire({
            icon: "success",
            title: "Reported!",
            text: "Thank you for your report, our team will investigate the issue promptly. ",
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
              this.restService.getGameStatus()
                .toPromise()
                .then(data => this.gameService.setGameStatus(data));
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
          session: this.sessionToTerminate,
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
    this.initialized = "Please wait...";
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
      if (!this.user)
        return;
      lastValueFrom(
        this.restService.setPreferredStoreForGame(
          this.game.oneplayId,
          store.name
        )
      ).catch((error)=> {
        this.showError(error);
      });
    }
  }

  closeUserInfoContainer() {
    this._userInfoContainerRef?.close();
  }

  private goToSignUpPage() {
    this.restService.getLogInURL().subscribe({
      next: (response) => {
        if (response.url === "self") {
          this.router.navigate(["/login"]);
        } else {
          window.open(`${response.url}?partner=${response.partner_id}`, '_self');
        }
      },
      error: () => {
        this.router.navigate(["/login"]);
      },
    });
  }
  confirm() {
    let body: string = "";
    if (!!this.dob.value) {
      const year = this.dob.value['year'];
      const month = this.dob.value['month'] < 10 ? "0" + this.dob.value['month'] : this.dob.value['month'];
      const day = this.dob.value['day'] < 10 ? "0" + this.dob.value['day'] : this.dob.value['day'];
      body = `${year}-${month}-${day}`;
    }
    this.restService.updateProfile({dob: body}).subscribe(
      (data) => {
        this.authService.updateProfile({
          dob: body
        });
        this._userInfoContainerRef?.close();
        this.playGame(this.settingsModal, false, this.termsConditionModal);
      },
      (error) => {
        this.errorMessage = error.message;
      }
    );
  }

  private reportErrorOrTryAgain(result: SweetAlertResult<any>, response: any) {
   
    if (result.dismiss == Swal.DismissReason.cancel) {
      this.reportResponse = response;
      this._reportErrorModalRef = this.ngbModal.open(this.reportErrorModal, {
        centered: true,
        windowClass: "blurBG",
        modalDialogClass: "modal-sm",
        scrollable: true,
        backdrop: "static",
        keyboard: false,
      });
    } else if (result.isConfirmed) {
      this.startGame();
    }
    
  }

  openStreamDialog(container: ElementRef<HTMLDivElement>) {
    
    this._streamDialogRef?.close();
    this.streamConfigList = [];
    PlayConstants.STREAM_PLATFORM.forEach((data)=> {
      this.streamConfigList.push(new streamConfig(data));
    })
    this.streamConfigList = this.streamConfigList.sort((s1, s2)=> s1.sortIndex - s2.sortIndex);
    this.currentStreamConfigList = JSON.parse(JSON.stringify(this.streamConfigList));
    this.restService.getAllStreamConfigs().subscribe((res)=> {
      if (res.length > 0) {
        const selectedIds = new Set();
        for (let idx =0; idx<this.streamConfigList.length; idx++) {

          let stream = this.streamConfigList[idx]; 
       
          res.forEach((s)=> {
            if (!selectedIds.has(s.id)) {

              if (stream.isCustom && !stream.id && s.is_custom == "true") {
                this.streamConfigList[idx] = new streamConfig(s);
                stream = this.streamConfigList[idx];
                selectedIds.add(s.id);
                const data: streamConfig = this.addCustomToStreamConfig();
                if (data) 
                  this.streamConfigList.push(data);
              }
              else if (s.service_name == stream.serviceName && !stream.id) {
                this.streamConfigList[idx] = new streamConfig(s);
                selectedIds.add(s.id);
                stream = this.streamConfigList[idx];
              }
            }
          })
        }
        
        if (res.length == 3 && this.streamConfigList[2]?.isKeyAvailable) {
          const data: streamConfig = this.addCustomToStreamConfig();
          if (data) 
            this.streamConfigList.push(new streamConfig(data));
        }
        else if (res.length == 4 && this.streamConfigList[3]?.isKeyAvailable) {
          this.streamConfigList.push(new streamConfig(res[3]));
          const data: streamConfig = this.addCustomToStreamConfig();
          if (data) 
            this.streamConfigList.push(new streamConfig(data));
        } 

        this.currentStreamConfigList = JSON.parse(JSON.stringify(this.streamConfigList));
      }
      this._streamDialogRef = this.ngbModal.open(container, {
        centered: true,
        modalDialogClass: "modal-md",
        scrollable: true,
        keyboard: false,
      });
    }, (error)=> {
      this.showError(error);
    })
  }

  openStreamInput(stream: streamConfig) {
    this.streamConfigList.forEach((s, index)=> {
      s.setIsClicked(s.serviceName == stream.serviceName);
    })
  }
  get screenToShow() {
    if (this.streamConfigList.every((stream)=> !stream.getIsClicked()))
      return "BACK";
    else if (this.streamConfigList.some((stream)=> stream.getIsClicked() && stream.isAllDetailsFilled())) {
      // if (this.streamConfigList.some((stream, idx)=> stream.isSame(this.cu) ))
      return "SAVE";
    }
    return "DONE";
  }

  private updateCustomStream(streamConfigDetail: streamConfig) {
    this.restService.updateCustomStreamConfig(streamConfigDetail.id, streamConfigDetail.key).subscribe({
      next: (res)=> {
        this.isAnyValueStreamUpdated = true;
        this.selectedStreamConfig = null;
      },
      error: (error)=> ( this.streamErrorMsg = error.message )
    });
  }
  private addCustomStream(streamConfigDetail: streamConfig) {
    this.restService.addCustomStreamConfig(streamConfigDetail.serviceName, streamConfigDetail.key, streamConfigDetail.url).subscribe({
      next: (res: any)=> {
          this.isAnyValueStreamUpdated = true;
          streamConfigDetail.isClicked = false;
          streamConfigDetail.isKeyAvailable = true;
          this.canShowSuccessMsg = true;
          this.selectedStreamConfig = null;
          setTimeout(()=> ( this.canShowSuccessMsg = false ), 2000);
          this.streamConfigList.push(this.addCustomToStreamConfig());
      },
      error: (error)=> ( this.streamErrorMsg = error.message )
    })
  }

  saveStreamConfig() {
    const streamConfigDetail: streamConfig = this.streamConfigList.filter((s)=> s.isClicked && s.serviceName)[0];

    if (streamConfigDetail.isKeyAvailable) {
      this.updateCustomStream(streamConfigDetail);
    }
    else if (streamConfigDetail.isCustom) {
      this.addCustomStream(streamConfigDetail);
    } else {

      this.restService.addKeyToStreamConfig(streamConfigDetail.serviceName, streamConfigDetail.key).subscribe({
        next: ()=> {
          this.isAnyValueStreamUpdated = true;
          streamConfigDetail.isClicked = false;
          streamConfigDetail.isKeyAvailable = true;
          this.canShowSuccessMsg = true;
          this.selectedStreamConfig = null;
          setTimeout(()=> ( this.canShowSuccessMsg = false ), 1000);
        },
        error: (error)=> ( this.streamErrorMsg = error.message )
      })
    }
  }
  closeStreamDialog() {
    this.resetStreamConfigValues();
    this._streamDialogRef?.close();
  }

  showError(error, doAction: boolean = false) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    })
  }
  showSuccess(response) {
    Swal.fire({
      title: response.title,
      text: response.message,
      imageUrl: response.icon,
      confirmButtonText: response.primary_CTA,
      showCancelButton: response.showSecondaryCTA,
      cancelButtonText: response.secondary_CTA
    })
  }
}
