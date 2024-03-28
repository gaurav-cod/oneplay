import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
import Swal from "sweetalert2";

@Component({
  selector: 'app-home-v2',
  templateUrl: './home-v2.component.html',
  styleUrls: ['./home-v2.component.scss'],
  providers: [GLinkPipe]
})
export class HomeV2Component implements OnInit, OnDestroy {


  @ViewChild("heroBannerVideo") heroBannerVideo: ElementRef<HTMLVideoElement>;

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
  ) { }

  get domain() {
    return environment.domain;
  }
  get getBannerImage() {
    return window.innerWidth > 475 ? this.selectedBannerGame.poster_hero_banner_16_9 : this.selectedBannerGame.poster_hero_banner_1_1;
  }
  get getBannerImageBlurHash() {
    return window.innerWidth > 475 ? this.selectedBannerGame.poster_hero_banner_16_9_blurhash : this.selectedBannerGame.poster_hero_banner_1_1_blurhash;
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

  @HostListener('click', ['$event'])
  clickout(event) {
    this.firstSignUpMsgTimer = 0;
    clearInterval(this.messageTimer);
    this.authService.setTriggerInitialModal(true);
  }

  @HostListener("window:scroll", [])
  onScroll(): void {

    // for infinite scroll
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
      this.loadMoreRails();
    }

    // pause video on scroll
    if (this.heroBannerVideo) {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollHeight = document.body.scrollHeight;
      const scrollPercentage = (scrollPosition / (scrollHeight - viewportHeight)) * 100;

      if (scrollPercentage >= 10) {
        this.heroBannerVideo.nativeElement.pause();
      } else {
        this.heroBannerVideo.nativeElement.play();
      }
    }
  }

  ngOnInit(): void {

    this.title.setTitle("OnePlay - India’s biggest BYOG cloud gaming platform | Everything gaming.");
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
            if (!this.getTrailerVideo) {
              clearTimeout(this.bannerShowTimer);
              this.bannerShowTimer = setTimeout(() => {
                this.moveSelectedCard("RIGHT");
              }, 5000);
            }

            // play initial video in 2sec
            clearTimeout(this.playVideoTimer);
            this.playVideoTimer = setTimeout(() => {
              this.playVideo = true;
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

  swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
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
      }
    }
  }

  navigateToDetail(game) {
    if (window.innerWidth <= 475) { 
      this.router.navigate(["view", this.gLink.transform(game)]);
    }
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
      this.playVideo = true;
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
    if (!this.getTrailerVideo) {
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
      this.playVideo = true;
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
