import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { GameService } from "src/app/services/game.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-common-layout",
  templateUrl: "./common-layout.component.html",
  styleUrls: ["./common-layout.component.scss"],
})
export class CommonLayoutComponent implements OnInit, OnDestroy {
  public isAuthenticated = false;

  private timer: any;

  constructor(
    private readonly authService: AuthService,
    private readonly restService: RestService,
    private readonly gameService: GameService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.sessionTokenExists.subscribe((exists) => {
      this.isAuthenticated = exists;
      if (exists) {
        this.authService.wishlist = this.restService.getWishlist();
        this.authService.user = this.restService.getProfile();
        this.gameService.gameStatus = this.restService.getGameStatus();

        this.timer = setInterval(() => {
          this.gameService.gameStatus = this.restService.getGameStatus();
        }, 5 * 60 * 1000);

        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            this.gameService.gameStatus = this.restService.getGameStatus();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
