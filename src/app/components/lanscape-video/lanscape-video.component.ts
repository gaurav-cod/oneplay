import { Component, Input, OnInit } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';

@Component({
  selector: 'app-lanscape-video',
  templateUrl: './lanscape-video.component.html',
  styleUrls: ['./lanscape-video.component.scss']
})
export class LanscapeVideoComponent implements OnInit {

  @Input("game") videoCard: GameModel;

  ngOnInit(): void {
  }
  goToStream() {

  }

  get viewerCount() {
    return this.videoCard.streaming > 1000 ? ((this.videoCard.streaming/1000) + "k") : this.videoCard.streaming;
  }
}
