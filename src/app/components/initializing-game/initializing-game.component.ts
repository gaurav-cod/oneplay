import { Component, Input, OnInit } from '@angular/core';
import { GameModel } from 'src/app/models/game.model';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-initializing-game',
  templateUrl: './initializing-game.component.html',
  styleUrls: ['./initializing-game.component.scss']
})
export class InitializingGameComponent implements OnInit{
  @Input() initialized: string;
  @Input() game: GameModel;
  @Input() progress: number;
  tip;
  tip_msg: string;
  tip_count: number = 1;

  constructor(
    private readonly restService: RestService,
  ) {}

  ngOnInit(): void {
    this.restService.getTip().subscribe(
      (data)=> {
        this.tip = data;
        this.tip_msg = this.tip.data[0];
        setInterval(() => {
          if(this.tip_count == this.tip.data.length) {
            this.tip_count = 0;
          }
          if(this.tip.data.length > 0) {
            this.tip_msg = this.tip.data[this.tip_count];
            this.tip_count++;
          }
        }, 3000);
      }
    ); 
  }
}
