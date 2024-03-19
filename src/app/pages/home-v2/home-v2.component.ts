import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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

  public heroBannerRow: GameFeedModel;
  public railRowCards: (GameFeedModel | VideoFeedModel | GamezopFeedModel)[] = [];
  public landscapeRowCards: VideoFeedModel[] = [];

  public selectedHeroBannerId: string;
  public selectedBannerGame: GameModel;
  public playVideo: boolean = false;
  public isVideoMute: boolean = true;

  private _feedSubscription: Subscription;
  private _paramSubscription: Subscription;
  private _userSubscription: Subscription;

  private wishlist: string[] = [];
  loadingWishlist = false;

  private bannerShowTimer: NodeJS.Timer;
  private playVideoTimer: NodeJS.Timer;

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
    return window.innerWidth > 475 ? this.selectedBannerGame.poster_16_9 : this.selectedBannerGame.poster_1_1;
  }
  get getBannerImageBlurHash() {
    return window.innerWidth > 475 ? this.selectedBannerGame.poster_16_9_blurhash : this.selectedBannerGame.poster_1_1_blurhash;
  }
  get getTrailerVideo() {
    return window.innerWidth > 475 ? this.selectedBannerGame.video_hero_banner_16_9 : this.selectedBannerGame.video_hero_banner_1_1;
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.loadMoreRails();
    }
  }

  ngOnInit(): void {

    this.title.setTitle("Home");
    this.loaderService.start();

    this._paramSubscription = this.activatedRoute.params.subscribe({
      next: (params) => {
        this._feedSubscription?.unsubscribe();

        this._feedSubscription = this.restService.getHomeFeed().subscribe({
          next: (response) => {
            const feeds = response.filter((feed) => (feed instanceof GameFeedModel && feed.games?.length > 0) || (feed instanceof VideoFeedModel && feed.videos?.length > 0) || (feed instanceof GamezopFeedModel && feed.games?.length > 0));
            this.heroBannerRow = feeds.filter((feed) => (feed as GameFeedModel).type === "hero_banner").at(0) as GameFeedModel;
            this.selectedHeroBannerId = this.heroBannerRow.games[0].oneplayId;
            this.selectedBannerGame = this.heroBannerRow.games[0];
            this.railRowCards = (feeds.filter((f) => f.type !== "hero_banner"));
            // f.type !== "hero_banner" && f.type !== "special_banner" && f.type !== "spotlight_banner"
            // if game does not contain video then by default banner will move to next game in 5sec
            if (!this.selectedBannerGame.trailer_video) {
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
          }, error: (error) => {
            this.loaderService.stop();
            if (error?.timeout) {
              this.router.navigateByUrl("/server-error");
            }
          }
        })

        this._userSubscription = this.authService.user.subscribe((user) => {
          this.userDetails = user;
          this.authService.wishlist.subscribe(
            (wishlist) => (this.wishlist = (wishlist ?? []))
          );
        });
      }
    })
  }
  ngOnDestroy(): void {
    this._feedSubscription?.unsubscribe();
    this._paramSubscription?.unsubscribe();
    this._userSubscription?.unsubscribe();
    clearTimeout(this.bannerShowTimer);
    clearTimeout(this.playVideoTimer);
    Swal.close();
  }

  loadMoreRails() {
    debugger;
    this.restService.getHomeFeed().subscribe({
      next: (response) => {
        const feeds = response.filter((feed) => (feed instanceof GameFeedModel && feed.games?.length > 0) || (feed instanceof VideoFeedModel && feed.videos?.length > 0) || (feed instanceof GamezopFeedModel && feed.games?.length > 0));
        this.railRowCards = [...this.railRowCards,  ...feeds.filter((f) => f.type !== "hero_banner")];
        debugger;
      }
    });
  }

  onSlideChange(event?: NgbSlideEvent) {
    let index = null;
    this.heroBannerRow.games.forEach((element, idx) => {
      if (element.oneplayId === this.selectedHeroBannerId)
        index = idx;
    });
    this.selectedHeroBannerId = this.heroBannerRow.games[(index + 1) % this.heroBannerRow.games.length].oneplayId;
    this.selectedBannerGame = this.heroBannerRow.games.filter((game) => game.oneplayId === this.selectedHeroBannerId)[0];
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
    this.selectedHeroBannerId = this.heroBannerRow.games[(currSelectedGameIndex + (direction == "LEFT" ? -1 : 1)) % this.heroBannerRow.games.length].oneplayId;
    this.selectedBannerGame = this.heroBannerRow.games.filter((game) => game.oneplayId === this.selectedHeroBannerId)[0];
    // if game does not contain video then by default banner will move to next game in 5sec
    this.playVideo = false;
    if (!this.selectedBannerGame.trailer_video) {
      this.bannerShowTimer = setTimeout(() => {
        this.moveSelectedCard("RIGHT");
      }, 5000);
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
