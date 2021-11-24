import { Component, OnInit } from "@angular/core";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent implements OnInit {
  games: GameModel[] = [];

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {
    this.restService
      .getFilteredGames()
      .subscribe((games) => (this.games = games));
  }
}
