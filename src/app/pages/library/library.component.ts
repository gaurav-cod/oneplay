import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GameModel } from "src/app/models/game.model";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-library",
  templateUrl: "./library.component.html",
  styleUrls: ["./library.component.scss"],
  providers: [GLinkPipe],
})
export class LibraryComponent implements OnInit {
  games: GameModel[] = [];
  page = 1;

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly gLink: GLinkPipe,
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.page = !!params.page ? parseInt(params.page) : 1;
      this.restService
        .getAllGames(this.page * 10 - 9)
        .subscribe((games) => (this.games = games));
    });
  }

  viewGame(game: GameModel) {
    this.countlyService.addEvent("gameLandingView", {
      gameID: game.oneplayId,
      gameTitle: game.title,
      gameGenre: game.genreMappings?.join(","),
      source: location.pathname + location.hash,
      trigger: "card",
      channel: "web",
    });

    this.router.navigate(["view", this.gLink.transform(game)]);
  }
}
