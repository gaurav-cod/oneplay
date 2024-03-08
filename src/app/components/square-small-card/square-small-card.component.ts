import { Component, Input, OnInit } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';

@Component({
  selector: 'app-square-small-card',
  templateUrl: './square-small-card.component.html',
  styleUrls: ['./square-small-card.component.scss']
})
export class SquareSmallCardComponent implements OnInit {

  @Input() game:GameModel;

  ngOnInit(): void {
  }
}
