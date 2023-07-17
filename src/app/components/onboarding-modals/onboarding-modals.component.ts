import { 
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { RestService } from "src/app/services/rest.service";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { UntypedFormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-onboarding-modals',
  templateUrl: './onboarding-modals.component.html',
  styleUrls: ['./onboarding-modals.component.scss']
})
export class OnboardingModalsComponent implements AfterViewInit, OnDestroy {

  @ViewChild("selectGameModal") selectGameModal: ElementRef<HTMLDivElement>;
  @ViewChild("onboardingUserModal") onboardingUserModal: ElementRef<HTMLDivElement>;

  selectedGameIds: string[] = [];
  games: GameModel[] = [];
  currentPage = 0;
  isLoading = false;
  canLoadMore = true;
  query = new UntypedFormControl("");
  searchText = "";
  checked: boolean = false;
  games_array = [];
  wishlistSubscription = undefined;
  
  private selected_games = [];

  private _selectgameRef: NgbModalRef;
  private _onboardingUserRef: NgbModalRef;
  

  constructor(
    private readonly authService: AuthService,
    private readonly ngbModal: NgbModal,

    private readonly restService: RestService,
    private readonly loaderService: NgxUiLoaderService,
  ) { }

  async ngAfterViewInit() {
    this.wishlistSubscription = this.authService.wishlist.subscribe((wishlist) => {
      if (localStorage.getItem("#onboardingUser") !== "true") {
        this.onboardingUser();
        localStorage.setItem("#closeonboardingGame", "true");
      } else if (!wishlist.length) this.selectGame();
    })
  }

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
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

  private loadGames() {
    this.startLoading();
    this.restService.search(this.searchText, 0, 12,'live').subscribe(
      (response) => {
        this.games = response.results;
        if (this.games.length < 12) {
          this.canLoadMore = false;
        }
        // this.orderGames();
        this.stopLoading();
      },
      (error) => {
        this.stopLoading();
      }
    );
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
        // this.orderGames();
        this.stopLoading();
        this.currentPage++;
      },
      (error) => {
        this.stopLoading();
      }
    );
  }

  private startLoading() {
    this.loaderService.startLoader("scroll");
    this.isLoading = true;
  }

  private stopLoading() {
    this.loaderService.stopLoader("scroll");
    this.isLoading = false;
  }

  private onboardingUser() {
    this._onboardingUserRef = this.ngbModal.open(this.onboardingUserModal, {
      centered: true,
      modalDialogClass: "modal-xl",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  private selectGame() {
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

  public closeSelectGame() {
    this._selectgameRef.close()  
    this.selectedGameIds.forEach((id)=>this.restService.addWishlist(id).subscribe())
    this.authService.wishlist = of(this.selectedGameIds)
    // this.selected_games = []
  }

  public async closeonboardingGame() {
    localStorage.setItem("#onboardingUser", "true");
    this._onboardingUserRef.close()
    this.wishlistSubscription = this.authService.wishlist.subscribe((wishlist) => {
      if (!wishlist.length) this.selectGame();
    })
  }

  public isChecked(game: GameModel) {
    return this.selectedGameIds.includes(game.oneplayId);
  }

  public checkedValue(game: GameModel) {
    if(this.isChecked(game)){
      this.selectedGameIds = this.selectedGameIds.filter((id)=>id!==game.oneplayId)
      this.selected_games = this.selected_games.filter((row)=>row.oneplayId!==game.oneplayId)
    } else {
      this.selectedGameIds = [...this.selectedGameIds, game.oneplayId]
      this.selected_games.push(game);
    }
  }

  // public orderGames () {
  //   this.games_array = [...this.selected_games];
  //   this.games.forEach(game => {
  //     if(!this.isChecked(game)) {
  //       this.games_array.push(game);
  //     }
  //   });
  // }
  get domain() {
    return environment.domain;
  }
}
