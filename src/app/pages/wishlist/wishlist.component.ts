import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { GameModel } from "src/app/models/game.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { Subscription, of } from "rxjs";
import { UntypedFormControl } from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";

@Component({
  selector: "app-wishlist",
  templateUrl: "./wishlist.component.html",
  styleUrls: ["./wishlist.component.scss"],
})
export class WishlistComponent implements OnInit, OnDestroy {
  @ViewChild("selectGameModal") selectGameModal: ElementRef<HTMLDivElement>;
  
  games: GameModel[] = [];
  private wishlistSubscription: Subscription;
  selectedGameIds: string[] = [];
  currentPage = 0;
  isLoading = false;
  canLoadMore = true;
  query = new UntypedFormControl("");
  searchText = "";
  checked: boolean = false;
  games_array = [];
  selectedGames: GameModel[] = [];

  private selected_games = [];

  private _selectgameRef: NgbModalRef;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly title: Title,
    private readonly ngbModal: NgbModal,
    private readonly loaderService: NgxUiLoaderService,
  ) {}

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.title.setTitle("OnePlay | Wishlist");
    this.wishlistSubscription = this.authService.wishlist.subscribe((ids) => {
      this.restService
        .getWishlistGames(ids)
        .subscribe((games) => (this.selectedGames = games));
    });
  }

  onScroll() {
    this.loadMore();
  }

  onSearch() {
    this.searchText = this.query.value.trim();
    this.canLoadMore = true;
    this.currentPage = 0;
    this.loadGames();
  } 
  
  selectGame() {
    this.canLoadMore = true;
    this.currentPage = 0;
    this.loadGames();
    this._selectgameRef = this.ngbModal.open(this.selectGameModal, {
      centered: true,
      modalDialogClass: "modal-lg",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    })
  }

  private loadGames() {
    this.startLoading();
    this.restService.search(this.searchText, 0, 12,'live').subscribe(
      (response) => {
        this.games = response.results;
        if (this.games.length < 12) {
          this.canLoadMore = false;
        }
        this.orderGames();
        this.stopLoading();
      },
      (error) => {
        this.stopLoading();
      }
    );
  }

  isGameInSelectedgames(game: GameModel) {
    let t = false
    console.warn(this.selectedGames.length)
    for (const element of this.selectedGames) {
      console.warn(element.oneplayId === game.oneplayId, element.oneplayId, game.oneplayId)
      if (element.oneplayId === game.oneplayId) {
        t = true;
      }
    }
    return t
  }

  public orderGames () {
    this.games_array = [...this.selected_games];
    this.games.forEach(game => {
      if(!this.isChecked(game)) {
        this.games_array.push(game);
      }
    });
    for (const element of this.selectedGames) {
      this.games_array = this.games_array.filter(game => game.oneplayId !== element.oneplayId)
    }
    // this.games_array.splice(12);
  }

  private startLoading() {
    this.loaderService.startLoader("scroll");
    this.isLoading = true;
  }

  private stopLoading() {
    this.loaderService.stopLoader("scroll");
    this.isLoading = false;
  }

  private loadMore() {
    if (this.isLoading || !this.canLoadMore) {
      return;
    }
    this.startLoading();
    this.restService.search(this.searchText, this.currentPage + 1, 12,'live').subscribe(
      (games) => {
        this.games = [...this.games, ...games.results];
        if (games.results.length < 12) {
          this.canLoadMore = false;
        }
        this.orderGames();
        this.stopLoading();
        this.currentPage++;
      },
      (error) => {
        this.stopLoading();
      }
    );
  }

  public closeSelectGame() {
    this._selectgameRef.close()  
    this.selectedGameIds.forEach((id)=>this.restService.addWishlist(id).subscribe())
    this.authService.wishlist = of(this.selectedGameIds)
    this.authService.wishlist = this.restService.getWishlist();
    this.selected_games = []
  }

  public isChecked(game: GameModel) {
    return this.selectedGameIds.includes(game.oneplayId);
  }

  public checkedValue(game: GameModel) {
    if(this.isChecked(game)){
      this.selectedGameIds = this.selectedGameIds.filter((id)=>id!==game.oneplayId)
      this.selected_games.push(game);
    } else {
      this.selectedGameIds = [...this.selectedGameIds, game.oneplayId]
    }
    console.log('selectedGames',this.selectedGameIds);
  }

  
}
