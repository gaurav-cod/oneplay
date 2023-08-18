import { Component, OnInit } from '@angular/core';
import { Session } from 'protractor';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-gameplay-history',
  templateUrl: './gameplay-history.component.html',
  styleUrls: ['./gameplay-history.component.scss']
})
export class GameplayHistoryComponent implements OnInit{
  gamePlaysessions = [];
  currentPage = 1;
  pagelimit = 100;
  loadMoreBtn = true;

  constructor(
    private readonly restService: RestService,
  ) {}

  ngOnInit(): void {
    this.restService.getGameplayHistory(1, this.pagelimit).subscribe((data) => {
      this.gamePlaysessions = data;
    });
  }

  loadMore() {
    this.restService.getGameplayHistory(this.currentPage + 1, this.pagelimit).subscribe((data) => {
      this.gamePlaysessions = data;
      this.currentPage++;
      if (data.length < 100) {
        this.loadMoreBtn = false;
      }
    });
  }
}
