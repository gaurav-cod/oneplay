import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { GameModel } from "src/app/models/game.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
  query: string;
  games: GameModel[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly restService: RestService,
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.query = params.q;
      this.title.setTitle("OnePlay | Search " + params.q);
      this.restService
        .search(params.q)
        .subscribe((games) => (this.games = games));
    });
  }
}
