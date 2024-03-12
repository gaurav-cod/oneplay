import { Component, Input, OnInit } from '@angular/core';
import { GameFeedModel } from 'src/app/models/gameFeed.model';

@Component({
  selector: 'app-category-small-rail',
  templateUrl: './category-small-rail.component.html',
  styleUrls: ['./category-small-rail.component.scss']
})
export class CategorySmallRailComponent implements OnInit {

  @Input() gameFeed: GameFeedModel;

  get getBackgroundImage() {
    return 1;
  }

  ngOnInit() {
    console.log(this.gameFeed);
  }
}
