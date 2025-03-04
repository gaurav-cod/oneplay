import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { GameModel } from 'src/app/models/game.model';
import { GameFeedModel } from 'src/app/models/gameFeed.model';
import { GamezopFeedModel } from 'src/app/models/gamezopFeed.model';
import { VideoFeedModel } from 'src/app/models/streamFeed.model';
import { TransformMessageModel } from 'src/app/models/tansformMessage.model';
import { UserModel } from 'src/app/models/user.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { RestService } from 'src/app/services/rest.service';
import { environment } from 'src/environments/environment';
import { UserAgentUtil } from "src/app/utils/uagent.util";
import Swal from "sweetalert2";

@Component({
  selector: 'app-home-v2',
  templateUrl: './home-v2.component.html',
  styleUrls: ['./home-v2.component.scss'],
  providers: [GLinkPipe]
})
export class HomeV2Component implements OnInit, OnDestroy {

  public heroBannerRow: GameFeedModel;
  public library: GameModel[] = [];
  public railRowCards: (GameFeedModel | VideoFeedModel | GamezopFeedModel)[] = [];
  public landscapeRowCards: VideoFeedModel[] = [];

  public selectedHeroBannerId: string;
  public selectedBannerGame: GameModel;
  public playVideo: boolean = false;
  public isVideoMute: boolean = true;

  private swipeCoord?: [number, number];
  private swipeTime?: number;
  private pageNo: number = 0;
  private railDataToPush:(GameFeedModel | VideoFeedModel | GamezopFeedModel)[] = [];

  public firstSignUpMsgTimer: number | null = null;
  private isDragged: boolean = false;

  private _feedSubscription: Subscription;
  private _paramSubscription: Subscription;
  private _userSubscription: Subscription;
  private _wishlistSubscription: Subscription;

  private wishlist: string[] = [];
  loadingWishlist = false;

  private bannerShowTimer: NodeJS.Timer;
  private playVideoTimer: NodeJS.Timer;
  private messageTimer: NodeJS.Timer;

  private userDetails: UserModel | null = null;

  constructor(
    private readonly restService: RestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly authService: AuthService,
    private readonly gLink: GLinkPipe,
    private readonly meta: Meta,
  ) { }

  get domain() {
    return environment.domain;
  }
  get getBannerImage() {
    return window.innerWidth > 475 ? this.selectedBannerGame.poster_hero_banner_16_9 : this.selectedBannerGame.poster_hero_banner_1_1;
  }
  get getBannerImageBlurHash() {
    return JSON.parse(window.innerWidth > 475 ? this.selectedBannerGame.poster_hero_banner_16_9_blurhash : this.selectedBannerGame.poster_hero_banner_1_1_blurhash)?.blurhash;
  }
  get getTrailerVideo() {
    return window.innerWidth > 475 ? this.selectedBannerGame.video_hero_banner_16_9 : this.selectedBannerGame.video_hero_banner_1_1;
  }
  get username(): string | null {
    return this.userDetails?.username;
  }
  get allGamesLength(): number {
    return this.railRowCards?.length;
  }
  get canPlayHeroVideo() {
    return !(UserAgentUtil.parse().browser.toLowerCase().includes("safari") || UserAgentUtil.parse().app == "Oneplay App");
  }

  @HostListener('click', ['$event'])
  clickout(event) {
    this.firstSignUpMsgTimer = 0;
    clearInterval(this.messageTimer);
    this.authService.setTriggerInitialModal(true);
  }

  ngOnInit(): void {

    this.title.setTitle("OnePlay - Largest Cloud Gaming Platform from India");
    this.meta.updateTag({ name: "keywords", content: "cloud gaming, indian cloud gaming, cloud gaming india, cloud pc, cloud gaming pc, popular cloud gaming, cloud gaming service, android cloud gaming, linux gaming" });
    this.meta.updateTag({ name: "description", content: "Play any AAA gaming on any device, anywhere! with OnePlay's cloud gaming service, available in India and other regions. Register for free and Play now!" });
    this.meta.updateTag({ name: "og:description", content: "Play any AAA gaming on any device, anywhere! with OnePlay's cloud gaming service, available in India and other regions. Register for free and Play now!" });
    
    this.loaderService.start();

    this._paramSubscription = this.activatedRoute.params.subscribe({
      next: (params) => {
        this._feedSubscription?.unsubscribe();

        this._feedSubscription = this.restService.getHomeFeed({ page: this.pageNo }).subscribe({
          next: (response) => {
            const feeds = response.filter((feed) => (feed instanceof GameFeedModel && feed.games?.length > 0) || (feed instanceof VideoFeedModel && feed.videos?.length > 0) || (feed instanceof GamezopFeedModel && feed.games?.length > 0));
            this.heroBannerRow = feeds.filter((feed) => (feed as GameFeedModel).type === "hero_banner").at(0) as GameFeedModel;
            this.selectedHeroBannerId = this.heroBannerRow?.games[0].oneplayId;
            this.selectedBannerGame = this.heroBannerRow?.games[0];
            this.railRowCards = (feeds.filter((f) => f.type !== "hero_banner"));
            this.railDataToPush = this.railRowCards;
            // f.type !== "hero_banner" && f.type !== "special_banner" && f.type !== "spotlight_banner"
            // if game does not contain video then by default banner will move to next game in 5sec
            if (!this.getTrailerVideo || !this.canPlayHeroVideo) {
              clearTimeout(this.bannerShowTimer);
              this.bannerShowTimer = setTimeout(() => {
                this.moveSelectedCard("RIGHT");
              }, 5000);
            }

            // play initial video in 2sec
            clearTimeout(this.playVideoTimer);
            this.playVideoTimer = setTimeout(() => {
              this.playVideo = this.canPlayHeroVideo;
            }, 2000);


            document.body.click();
            this.loaderService.stop();
          }, error: (error) => {
            this.loaderService.stop();
            if (error?.timeout) {
              this.router.navigateByUrl("/server-error");
            }
          }
        })

        if (localStorage.getItem("is_new_user")) {
          localStorage.removeItem("is_new_user");
          this.firstSignUpMsgTimer = 5;
          this.messageTimer = setInterval(() => {
            this.firstSignUpMsgTimer--;
            if (this.firstSignUpMsgTimer == 0) {
              this.authService.setTriggerInitialModal(true);
              clearInterval(this.messageTimer);
            }
          }, 3000);
        }

        this._userSubscription = this.authService.user.subscribe((user) => {
          this.userDetails = user;
          this.authService.wishlist.subscribe(
            (wishlist) => (this.wishlist = (wishlist ?? []))
          );
        });
        this._wishlistSubscription = this.authService.wishlist.subscribe((ids) => {
          if (ids) {
            this.wishlist = ids;
            this.restService
              .getWishlistGames(ids)
              .subscribe((games) => {
                this.library = games;
              });
          }
        });
      }
    })
  }
  ngOnDestroy(): void {
    this._feedSubscription?.unsubscribe();
    this._paramSubscription?.unsubscribe();
    this._userSubscription?.unsubscribe();
    this._wishlistSubscription?.unsubscribe();
    clearTimeout(this.bannerShowTimer);
    clearTimeout(this.playVideoTimer);
    Swal.close();
  }

  swipe(e: any, when: string): void {
    this.isDragged = true;
    let clientX = 0, clientY = 0;
    if (e instanceof TouchEvent)
      clientX = e?.changedTouches[0]?.clientX, clientY = e?.changedTouches[0]?.clientY;
    else
      clientX = e?.clientX, clientY = e.clientY;
    const coord: [number, number] = [clientX, clientY];
    const time = new Date().getTime();

    if (when === 'start') {
      this.swipeCoord = coord;
      this.swipeTime = time;
    } else if (when === 'end') {
      const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
      const duration = time - this.swipeTime;

      if (duration < 1000 && Math.abs(direction[0]) > 30 && Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { 
          const swipe = direction[0] < 0 ? 'RIGHT' : 'LEFT';
          this.moveSelectedCard(swipe);
          this.isDragged = false;
      }
    }
    e.stopPropagation();
  }

  navigateToDetail(game) {
    if (window.innerWidth <= 475 && this.isDragged) { 
      this.router.navigate(["view", this.gLink.transform(game)]);
    }
  }
  toggleVideoAudio(event, value: boolean) {
    this.isVideoMute = value;
    event.stopPropagation();
  }

  loadMoreRails() {
    // this.pageNo++;
    // this.restService.getHomeFeed({page: this.pageNo}).subscribe({
    //   next: (response) => {
    //     const feeds = response.filter((feed) => (feed instanceof GameFeedModel && feed.games?.length > 0) || (feed instanceof VideoFeedModel && feed.videos?.length > 0) || (feed instanceof GamezopFeedModel && feed.games?.length > 0));
    //     this.railRowCards = [...this.railRowCards,  ...feeds.filter((f) => f.type !== "hero_banner")];
    //   }
    // });
    this.railRowCards = [...this.railRowCards, ...this.railDataToPush];
  }

  onSlideChange(event?: NgbSlideEvent) {
    let index = null;
    this.heroBannerRow.games.forEach((element, idx) => {
      if (element.oneplayId === this.selectedHeroBannerId)
        index = idx;
    });
    this.selectedHeroBannerId = this.heroBannerRow.games[(index + 1) % this.heroBannerRow.games.length].oneplayId;
    this.selectedBannerGame = this.heroBannerRow.games.filter((game) => game.oneplayId === this.selectedHeroBannerId)[0];
    this.playVideo = false;
    setTimeout(() => {
      this.playVideo = this.canPlayHeroVideo;
    }, 2000);
  }

  viewBannerGame(game: GameModel) {
    this.router.navigate(["view", this.gLink.transform(game)]);
  }

  moveSelectedCard(direction: "LEFT" | "RIGHT") {

    clearTimeout(this.bannerShowTimer);

    let currSelectedGameIndex = -1;
    this.heroBannerRow.games.forEach((game, index) => {
      if (game.oneplayId == this.selectedHeroBannerId)
        currSelectedGameIndex = index;
    })
    if (currSelectedGameIndex == 0 && direction == "LEFT") {
      this.selectedHeroBannerId = this.heroBannerRow.games.at(-1).oneplayId;
      this.selectedBannerGame = this.heroBannerRow.games.at(-1);
    } else {
      this.selectedHeroBannerId = this.heroBannerRow.games[(currSelectedGameIndex + (direction == "LEFT" ? -1 : 1)) % this.heroBannerRow.games.length].oneplayId;
      this.selectedBannerGame = this.heroBannerRow.games.filter((game) => game.oneplayId === this.selectedHeroBannerId)[0];
    }
    // if game does not contain video then by default banner will move to next game in 5sec
    this.playVideo = false;
    if (!this.getTrailerVideo || !this.canPlayHeroVideo) {
      this.bannerShowTimer = setTimeout(() => {
        this.moveSelectedCard("RIGHT");
      }, 5000);
    } else {
      this.bannerShowTimer = setTimeout(()=> {
        this.playVideo = true;
        clearTimeout(this.bannerShowTimer);
      }, 2000)
    }
  }

  cardSelected(game: GameModel) {
    this.selectedBannerGame = game; 
    this.selectedHeroBannerId = game.oneplayId;
    this.playVideo = false;
    setTimeout(() => {
      this.playVideo = this.canPlayHeroVideo;
    }, 2000);
  }
  videoEnded() {
    this.playVideo = false;
    this.onSlideChange();
  }

  getScaleByDistance(index: number) {
    let selectedBannerIdx = 1;
    for (let idx = 0; idx < this.heroBannerRow.games.length; idx++)
      if (this.selectedBannerGame.oneplayId == this.heroBannerRow.games[idx].oneplayId) {
        selectedBannerIdx = idx;
        break;
      }

    return 1 - (Math.abs(selectedBannerIdx - index) / 10);
  }

  get isInWishlist(): boolean {
    return this.wishlist.includes(this.selectedBannerGame?.oneplayId);
  }

  addToWishlist(game): void {
    this.loadingWishlist = true;
    this.restService.addWishlist(game.oneplayId).subscribe((response) => {
      this.loadingWishlist = false;
      this.showSuccess(new TransformMessageModel(response.data));
      this.authService.addToWishlist(game.oneplayId);
    }, (error)=> {
      this.showError(error);
    });
  }

  removeFromWishlist(game): void {
    this.loadingWishlist = true;
    this.restService.removeWishlist(game.oneplayId).subscribe((response) => {
      this.loadingWishlist = false;
      this.authService.removeFromWishlist(game.oneplayId);
      this.showSuccess(new TransformMessageModel(response.data));
    }, (error)=> {
      this.showError(error);
    });
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
