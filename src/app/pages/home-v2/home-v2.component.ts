import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { GameModel } from 'src/app/models/game.model';
import { GameFeedModel } from 'src/app/models/gameFeed.model';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RestService } from 'src/app/services/rest.service';
import { environment } from 'src/environments/environment';
import Swal from "sweetalert2";

@Component({
  selector: 'app-home-v2',
  templateUrl: './home-v2.component.html',
  styleUrls: ['./home-v2.component.scss']
})
export class HomeV2Component implements OnInit, OnDestroy {

  public heroBannerRow: GameFeedModel;
  public portraitCardRows: GameFeedModel[] = [];
  public selectedHeroBannerId: string;
  public selectedBannerGame: GameModel;
  public playVideo: boolean = false;

  private _feedSubscription: Subscription;
  private _paramSubscription: Subscription;
  private _userSubscription: Subscription;

  private bannerShowTimer: NodeJS.Timer;
  private playVideoTimer: NodeJS.Timer;

  private userDetails: UserModel | null = null;

  constructor(
    private readonly restService: RestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly authService: AuthService
  ) { }

  get domain() {
    return environment.domain;
  }
  get getBannerImage() {
    return  window.innerWidth > 475 ? this.selectedBannerGame.poster_16_9 : this.selectedBannerGame.poster_1_1;
  }
  get getBannerImageBlurHash() {
    return window.innerWidth > 475 ? this.selectedBannerGame.poster_16_9_blurhash : this.selectedBannerGame.poster_1_1_blurhash; 
  }

  ngOnInit(): void {

    this.title.setTitle("Home");
    this.loaderService.start();

    this._paramSubscription = this.activatedRoute.params.subscribe({
      next: (params)=> {
        this._feedSubscription?.unsubscribe();
        this._feedSubscription = this.restService.getHomeFeed().subscribe({
          next: (response) => {
            const feeds = response.filter((feed)=> feed.games.length > 0);
            this.heroBannerRow = feeds.filter((feed)=> feed.type === "hero_banner").at(0);
            this.selectedHeroBannerId = this.heroBannerRow.games[0].oneplayId;
            this.selectedBannerGame = this.heroBannerRow.games[0];
            this.portraitCardRows = feeds.filter((f) => f.type === "portrait_card" || "portrait_category");

            // if game does not contain video then by default banner will move to next game in 5sec
            if (!this.selectedBannerGame.trailer_video) {
              clearTimeout(this.bannerShowTimer);
              this.bannerShowTimer = setTimeout(()=> {
                this.moveSelectedCard("RIGHT");
              }, 5000);
            }
            
            // play initial video in 2sec
            clearTimeout(this.playVideoTimer);
            this.playVideoTimer = setTimeout(()=> {
              this.playVideo = true;
            }, 2000);
          }, error: (error)=> {
            this.loaderService.stop();
            if (error.timeout) {
              this.router.navigateByUrl("/server-error");
            }
          }
        })

        this._userSubscription = this.authService.user.subscribe((user) => {
          this.userDetails = user;
        });
      }
    })
  }
  ngOnDestroy(): void {
    this._feedSubscription?.unsubscribe();
    this._paramSubscription?.unsubscribe();
    clearTimeout(this.bannerShowTimer);
    clearTimeout(this.playVideoTimer);
    Swal.close();
  }

  onSlideChange(event?: NgbSlideEvent) {
    let index = null;
    this.heroBannerRow.games.forEach((element, idx) => {
      if (element.oneplayId === this.selectedHeroBannerId)
        index = idx;
    });
    this.selectedHeroBannerId = this.heroBannerRow.games[(index+1) % this.heroBannerRow.games.length].oneplayId;
    this.selectedBannerGame = this.heroBannerRow.games.filter((game)=> game.oneplayId === this.selectedHeroBannerId)[0];
    setTimeout(()=> {
      this.playVideo = true;
    }, 2000);
  }

  moveSelectedCard(direction: "LEFT" | "RIGHT") {

    clearTimeout(this.bannerShowTimer);

    let currSelectedGameIndex = -1;
    this.heroBannerRow.games.forEach((game, index)=> {
      if (game.oneplayId == this.selectedHeroBannerId)
        currSelectedGameIndex = index;
    })
    this.selectedHeroBannerId = this.heroBannerRow.games[(currSelectedGameIndex+ (direction == "LEFT" ? -1 : 1) ) % this.heroBannerRow.games.length].oneplayId;
    this.selectedBannerGame = this.heroBannerRow.games.filter((game)=> game.oneplayId === this.selectedHeroBannerId)[0];

     // if game does not contain video then by default banner will move to next game in 5sec
     if (!this.selectedBannerGame.trailer_video) {
      this.bannerShowTimer = setTimeout(()=> {
        this.moveSelectedCard("RIGHT");
      }, 5000);
    }
  }

  cardSelected(game: GameModel) {
    this.selectedBannerGame = game;
    this.selectedHeroBannerId = game.oneplayId;
  }
  videoEnded() {
    this.playVideo = false;
    this.onSlideChange();
  }

  getScaleByDistance(index: number) {
    let selectedBannerIdx = 1;
    for (let idx=0; idx < this.heroBannerRow.games.length; idx++)
      if (this.selectedBannerGame.oneplayId == this.heroBannerRow.games[idx].oneplayId) {
        selectedBannerIdx = idx;
        break;
      }

    return 1 -(Math.abs(selectedBannerIdx - index) / 10);
  }
}
