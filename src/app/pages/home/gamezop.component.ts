import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Subscription } from "rxjs";
import { GamezopModel } from "src/app/models/gamezop.model";
import { GamezopFeedModel } from "src/app/models/gamezopFeed.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-gamezop",
  templateUrl: "./gamezop.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [GLinkPipe],
})
export class Gamezop implements OnInit, OnDestroy {

  constructor(
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  private queries = {};
  private previousPage: string = "home";

  firstRow: GamezopFeedModel;
  restRows: GamezopFeedModel[] = [];
  loadingWishlist = false;
  library: GamezopModel[] = [];
  genreGames: GamezopModel[] = [];
  genreSelected: string = '';

  private wishlistSubscription: Subscription;
  private feedSubscription: Subscription;
  private gameFilterSubscription: Subscription;
  private paramsSubscription: Subscription;

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
    this.feedSubscription?.unsubscribe();
    this.gameFilterSubscription?.unsubscribe();
    this.paramsSubscription?.unsubscribe();
  }

  async ngOnInit()  {
    this.title.setTitle("Gamezop");
    this.loaderService.start();
    this.activatedRoute.queryParams.subscribe((qParam)=> {
      if (qParam['prevPage']) {
        this.previousPage = this.getPreviousPage(qParam['prevPage']);
      }
    })
    await this.restService.getGamezopCategory().toPromise().then((response)=> {
      response.forEach((res)=> {
        this.queries[res] = {
           genres: res 
        }
      })
    });

    this.paramsSubscription = this.route.params.subscribe({
      next: (params) => {
        this.feedSubscription?.unsubscribe();
        this.gameFilterSubscription?.unsubscribe();
        const query = params.filter;
        if (!query) {
          this.genreSelected = '';
        } else {

          this.genreSelected = query;
          this.gameFilterSubscription = this.restService
            .getGamezopFilteredGames(this.queries[query], 0)
            .subscribe((games) => {
              this.genreGames = games;
            });
        }
        this.feedSubscription = this.restService
          .getGamezopFeed()
          .subscribe((res) => {
            const feeds = res.filter((f) => f.games.length > 0);
            this.firstRow = feeds.filter((f) => f.type === 'header')[0];
            this.restRows = feeds.filter((f) => f.type === 'rail');
            document.body.click();
            this.loaderService.stop();
          },
            (error) => {
              this.loaderService.stop();
              if (error.timeout) {
                this.router.navigateByUrl('/server-error')
              }
            }
          );
      },
    });
  }

  private getPreviousPage(page) {
    switch(page) {
      case "store":
        return "/store";
      case "streams":
        return "/streams";
      case "wishlist":
        return "/wishlist";
      case "settings":
        return "/settings/profile"
      case "search":
        return "/search"
      default: 
        return "/home";
    }
  }

  viewBannerGame(game: GamezopModel) {
    window.open(game.url);
  }

  goBack() {
    this.router.navigate([this.previousPage]);
  }

  get routes() {
    return Object.keys(this.queries);
  }

}