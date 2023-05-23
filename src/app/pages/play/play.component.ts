import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PurchaseStore } from 'src/app/interface';
import { GameModel } from 'src/app/models/game.model';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {

  game: GameModel;
  selectedStore: PurchaseStore;

  resolution = new FormControl();
  fps = new FormControl();
  vsync = new FormControl();
  bitrate = new FormControl();

  advancedOptions = new FormGroup({
    show_stats: new FormControl(false),
    fullscreen: new FormControl(true),
    onscreen_controls: new FormControl(false),
    audio_type: new FormControl("stereo"),
    stream_codec: new FormControl("auto"),
    video_decoder_selection: new FormControl("auto"),
  });

  constructor(
    private readonly restService: RestService,
  ) { }

  ngOnInit(): void {
  
    let game_id = "1";
    let resolution = "1920x1080";
    if (location.search.includes("game_id")) {
      game_id = location.search.split("game_id=")[1].split("&")[0];
    }
    if (location.search.includes("resolution")) {
      resolution = location.search.split("resolution=")[1].split("&")[0];
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const data = JSON.parse(this.responseText);
        // do something with the data
      }
    };
    xhttp.open("POST", `https://svrdev.oneplay.in/application_services/frontend/start/game/${game_id}?resoulution=${resolution}`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader("Proxy", "192.168.60.227:5128");
    xhttp.setRequestHeader("SSL-Verify-Host", "0");
    xhttp.setRequestHeader("SSL-Verify-Peer", "0");
    xhttp.send();
  }

}
