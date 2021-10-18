import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit {
  game: GameModel;

  constructor(
    private readonly location: Location,
    private readonly restService: RestService
  ) {
  }
  
  ngOnInit(): void {
    console.log("CALL")
    this.restService
      .getGameDetails(
        "5048a2e1462d5b3f8a983976df3313cb5f2583e8c51d369e4c84470ccdd145eb"
      )
      .subscribe((game) => this.game = game);
  }

  back(): void {
    this.location.back();
  }
}
