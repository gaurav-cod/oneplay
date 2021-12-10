import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-store",
  templateUrl: "./store.component.html",
  styleUrls: ["./store.component.scss"],
})
export class StoreComponent implements OnInit {
  games: GameModel[] = [];

  constructor(private readonly restService: RestService, private readonly title: Title) {}

  ngOnInit(): void {
    this.title.setTitle("OnePlay | Store");
    this.restService
      .getFilteredGames()
      .subscribe((games) => (this.games = games));
  }
}
