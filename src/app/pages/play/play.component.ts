import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { PurchaseStore, WebPlayTokenRO } from 'src/app/interface';
import { GameModel } from 'src/app/models/game.model';
import { RestService } from 'src/app/services/rest.service';
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import UAParser from 'ua-parser-js';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit, OnDestroy {

  game: GameModel;
  selectedStore: PurchaseStore;

  resolution = new FormControl();
  fps = new FormControl();
  vsync = new FormControl();
  bitrate = new FormControl();
  session = "";
  payload = "";

  private _webplayTokenSubscription: Subscription;

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
    private readonly loaderService: NgxUiLoaderService,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

   ngOnDestroy(): void {
    this._webplayTokenSubscription?.unsubscribe();
    Swal.close();
  }

  ngOnInit(): void {
    const session = this.route.snapshot.queryParams["session"];
    const payload = this.route.snapshot.queryParams["payload"];
    
    this.session = session;
    this.payload = payload;

    window.location.href = `oneplay:key?payload=${payload}&session_token=${this.authService.sessionToken}`;
  }

  get link() {
    return `${environment.domain}/dashboard/play?payload=${this.payload}&session=${this.session}`;
  }

  reloadCurrentPage() {
    window.location.reload();
  }

  startGameWithWebRTCToken(millis = 0): void {
    if (!environment.webrtc_prefix) {
      Swal.fire({
        icon: "error",
        title: "Web-Play",
        text: "Play on web is coming soon!",
      });
      return;
    }

    if (millis === 0) {
      this.loaderService.start();
    } else if (millis > 60000) {
      this.loaderService.stop();
      Swal.fire({
        title: "Oops! Something went wrong",
        imageUrl: "assets/img/swal-icon/Game-Terminated.svg",
        customClass: "swalPaddingTop",
        confirmButtonText: "Okay",
      });
      return;
    }

    const startTime = Date.now();

    this._webplayTokenSubscription?.unsubscribe();

    this._webplayTokenSubscription = this.restService
      .getWebPlayToken(this.session)
      .subscribe({
        next: (res) =>
          this.startGameWithWebRTCTokenSuccess(res, startTime, millis),
        error: (err) => this.startGameWithWebRTCTokenFailed(err),
      });
  }

  private startGameWithWebRTCTokenSuccess(
    res: WebPlayTokenRO,
    startTime: number,
    millis: number
  ) {
    if (res.data.service === "running" && !!res.data.web_url) {
      const url = new URL(environment.webrtc_prefix);
      const device = new UAParser().getDevice().type ?? "";
      url.searchParams.set(
        "platform",
        /mobile|tablet/i.test(device) ? "mobile" : "desktop"
      );

      window.open(url.href + "&" + res.data.web_url.replace(/\?/, ""), "_self");

      this.loaderService.stop();
    } else {
      const timeTaken = Date.now() - startTime;
      if (timeTaken >= 2000) {
        this.startGameWithWebRTCToken(timeTaken + millis);
      } else {
        const delay = 2000 - timeTaken;
        setTimeout(
          () => this.startGameWithWebRTCToken(timeTaken + millis + delay),
          delay
        );
      }
    }
  }

  private startGameWithWebRTCTokenFailed(err: any) {
    this.loaderService.stop();
    Swal.fire({
      title: "Error Code: " + err.code,
      text: err.message,
      icon: "error",
      confirmButtonText: "Try Again",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        this.startGameWithWebRTCToken();
      }
    });
  }
}
