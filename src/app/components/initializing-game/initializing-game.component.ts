import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameModel } from 'src/app/models/game.model';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-initializing-game',
  templateUrl: './initializing-game.component.html',
  styleUrls: ['./initializing-game.component.scss']
})
export class InitializingGameComponent implements OnInit, OnDestroy{
  @Input() initialized: string;
  @Input() game: GameModel;
  @Input() progress: number;
  @Input() errored: boolean;

  tips: Subscription;
  tip_msg: string;
  tip_count: number = 1;
  timer: NodeJS.Timer;

  constructor(
    private readonly restService: RestService,
  ) {}

  ngOnDestroy(): void {
    console.log("INITIALIZATION ENDED")
    this.tips?.unsubscribe();
    clearInterval(this.timer)
  }

  ngOnInit(): void {
    console.log("INITIALIZATION STARTED")
     this.tips = this.restService.getTip().subscribe(
      (data)=> {
        this.tip_msg = data[0];
        this.timer = setInterval(() => {
          if (!this.errored) {
            if(this.tip_count == data.length) {
              this.tip_count = 0;
            }
            if(data.length > 0) {
              this.tip_msg = data[this.tip_count];
              this.tip_count++;
            }
          }
        }, 5000);
      }
    ); 
  }
}
