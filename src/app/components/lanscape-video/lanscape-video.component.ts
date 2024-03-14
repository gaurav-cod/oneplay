import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameModel } from 'src/app/models/game.model';
import { VideoModel } from 'src/app/models/video.model';

@Component({
  selector: 'app-lanscape-video',
  templateUrl: './lanscape-video.component.html',
  styleUrls: ['./lanscape-video.component.scss']
})
export class LanscapeVideoComponent implements OnInit {

  @Input("video") videoCard: VideoModel;

  constructor(
    private readonly router: Router
  ) {}

  ngOnInit(): void {
  }

  goToStream() {
    this.router.navigate([`/streams/${encodeURIComponent(JSON.stringify( { video:  this.videoCard} ))}`]);
  }

  get viewerCount() {
    return this.videoCard.sourceViews > 1000 ? ((this.videoCard.sourceViews / 1000) + "k") : this.videoCard.sourceViews;
  }
}
