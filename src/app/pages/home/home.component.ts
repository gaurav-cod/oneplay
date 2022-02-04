import { Component, OnInit } from "@angular/core";
import { GameFeedModel } from "src/app/models/gameFeed.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  firstRow: GameFeedModel;
  restRows: GameFeedModel[] = [];

  constructor(private readonly restService: RestService) {
    this.restService.getHomeFeed().subscribe((res) => {
      const games = res.games.filter((g) => g.games.length > 0);
      this.firstRow = games[0];
      this.restRows = games.slice(1);
    });
  }

  ngOnInit(): void {
    document.body.click();
  }
}
