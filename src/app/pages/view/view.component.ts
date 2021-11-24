import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit {
  game: GameModel;
  similarGames: GameModel[] = [];

  constructor(
    private readonly location: Location,
    private readonly restService: RestService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.restService
        .getGameDetails(params.id)
        .subscribe((game) => (this.game = game));
      this.restService
        .getSimilarGames(params.id)
        .subscribe((games) => (this.similarGames = games));
    });
  }

  back(): void {
    this.location.back();
  }
}
