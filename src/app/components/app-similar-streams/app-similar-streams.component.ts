import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';

@Component({
  selector: 'app-similar-streams',
  templateUrl: './app-similar-streams.component.html',
  styleUrls: ['./app-similar-streams.component.scss']
})
export class AppSimilarStreamsComponent implements OnInit {
  @Input("game") game: GameModel;
  @Input("queryParams") queryParams?: any;
  @Input("hasFixedWidth") hfw: boolean = false;
  @Input("calledFrom") calledFrom:
    | "HOME"
    | "STORE_INSTALL_PLAY"
    | "STORE_OTHER"
    | "LIBRARY" = "HOME";

  @Output("gameClick") gameClick = new EventEmitter();
  
  ngOnInit(): void {
  }
}
