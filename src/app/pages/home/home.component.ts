import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild("legalWelcomeModal") legalWelcomeModal: ElementRef<HTMLDivElement>;
  firstRow: GameFeedModel;
  restRows: GameFeedModel[] = [];
  loadingWishlist = false;

  private wishlist: string[] = [];

  get showNavigation(): boolean {
    return window.innerWidth < 768;
  }

  get showIndicator(): boolean {
    return window.innerWidth > 768;
  }

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly loaderService: NgxUiLoaderService,
    private readonly title: Title,
    private readonly ngbModal: NgbModal,
  ) {}
  ngAfterViewInit(): void {
    if (sessionStorage.getItem('#legalModal') !== 'true') {
      this.welcomeModal();
      setTimeout(() => this.ngbModal.dismissAll(),20000);
      sessionStorage.setItem('#legalModal','true');     
    }
  }

  ngOnInit(): void {
    this.title.setTitle("Home");
    this.loaderService.start();
    this.restService.getHomeFeed().subscribe((res) => {
      const games = res.games.filter((g) => g.games.length > 0);
      this.firstRow = games[0];
      this.restRows = games.slice(1);
      document.body.click();
      this.loaderService.stop();
    });
    this.authService.wishlist.subscribe(
      (wishlist) => (this.wishlist = wishlist)
    );
    this.authService.user.subscribe((user) => {
      if (user.status !== "active") {
        Swal.fire({
          icon: "warning",
          title: "Hi, " + user.firstName,
          html: `Your account is yet to be verified. Please give us 24 hrs to do so.
          Until then, kindly <a href="https://oneplay.in/download.html">download client</a> info from our website
          Thankyou for your patience!`,
          confirmButtonText: "OK",
        });
      }
    });
  }

  isInWishlist(game: GameModel): boolean {
    return this.wishlist.includes(game.oneplayId);
  }

  addToWishlist(game: GameModel): void {
    this.loadingWishlist = true;
    this.restService.addWishlist(game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.addToWishlist(game.oneplayId);
    });
  }

  removeFromWishlist(game: GameModel): void {
    this.loadingWishlist = true;
    this.restService.removeWishlist(game.oneplayId).subscribe(() => {
      this.loadingWishlist = false;
      this.authService.removeFromWishlist(game.oneplayId);
    });
  }

  private welcomeModal() {
    this.ngbModal.open(this.legalWelcomeModal, {
      centered: true,
      modalDialogClass: "modal-lg",
    });
  }
}
