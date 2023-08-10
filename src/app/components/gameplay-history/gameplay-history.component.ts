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

  constructor(
    private readonly restService: RestService,
  ) {}

  ngOnInit(): void {
    // console.warn('sfdjksdhfuhriuvncm',this.gamePlaysessions);
    // this.restService.getGameplayHistory().subscribe((res) => {
    //   this.gamePlaysessions = res;
    //   console.warn('sfdjksdhfuhriuvncm',this.gamePlaysessions);
    // });
  }
}
