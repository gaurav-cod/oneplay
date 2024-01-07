import { Component, OnInit } from "@angular/core";
import { Session } from "protractor";
import { GameplayHistoryModel } from "src/app/models/gameplay.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-gameplay-history",
  templateUrl: "./gameplay-history.component.html",
  styleUrls: ["./gameplay-history.component.scss"],
})
export class GameplayHistoryComponent implements OnInit {
  gamePlaysessions: GameplayHistoryModel[] = [];
  currentPage = 1;
  readonly pagelimit = 20;
  loadMoreBtn: boolean = false;
  loading = true;

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {
    this.restService.getGameplayHistory(1, this.pagelimit).subscribe((data) => {
      this.loadMoreBtn = data.length === this.pagelimit;
      this.gamePlaysessions = data;
      this.currentPage++;
      this.loading = false;
    });
  }

  loadMore() {
    this.loading = true;
    this.restService
      .getGameplayHistory(this.currentPage, this.pagelimit)
      .subscribe({
        next: (data) => {
          this.loadMoreBtn = data.length === this.pagelimit;
          this.gamePlaysessions = [...this.gamePlaysessions, ...data];
          this.currentPage++;
        
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
