import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-library",
  templateUrl: "./library.component.html",
  styleUrls: ["./library.component.scss"],
})
export class LibraryComponent implements OnInit {
  games: GameModel[] = [];
  page = 1;

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.page = !!params.page ? parseInt(params.page) : 1;
      this.restService
        .getAllGames((this.page * 10) - 9)
        .subscribe((games) => (this.games = games));
    });
  }
}
