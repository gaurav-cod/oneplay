import { Component, OnInit } from "@angular/core";
import { RestService } from "src/app/services/rest.service";
import { throttle_to_latest as throttle } from "src/app/utils/throttle.util";
import { v4 } from "uuid";

type State = "Ping" | "Download" | "Upload";

@Component({
  selector: "app-speed-test",
  templateUrl: "./speed-test.component.html",
  styleUrls: ["./speed-test.component.scss"],
})
export class SpeedTestComponent implements OnInit {
  latencyText = "0";
  jitterText = "0";
  downloadText = "00.00";
  uploadText = "00.00";
  progressValue = "1 1000";
  throttleTime = 10;
  messages = {
    default: {
      class: '',
      text: '',
    },
    optimal: {
      class: 'primaryGradientColor',
      text: 'Your network is optimal for streaming',
    },
    not_optimal: {
      class: 'errorGradientColor',
      text: 'Network conditions are not optimal for streaming',
    },
    stutter: {
      class: 'yellowGradient',
      text: 'You may experience stutter of high latency',
    },
  }
  private _TsetLatencyText = throttle(
    (v: string) => (this.latencyText = v),
    this.throttleTime
  );
  private _TsetJitterText = throttle(
    (v: string) => (this.jitterText = v),
    this.throttleTime
  );
  private _TsetDownloadText = throttle(
    (v: string) => (this.downloadText = v),
    this.throttleTime
  );
  private _TsetUploadText = throttle(
    (v: string) => (this.uploadText = v),
    this.throttleTime
  );
  private _TsetProgressValue = throttle((v: string) => {
    this.progressValue = v;
  }, this.throttleTime);

  pingCount = 100;
  pingPacketsSent = [];
  pingPacketsRecieved = [];
  dlPacketsSize = 4000000;
  ulPacketsSize = 1050000;
  // dlPacketsCount = 0;
  // dlDataRecieved = 0;
  // dlStartTime = 0;
  // dlEndTime = 0;
  // ulEndTime = 0;
  // ulStartTime = 0;
  // ulPacketsSize = 5242880;
  // ulPacketsCount = 100;
  // ulPacketsConfirmed = 0;
  testCompleted = false;
  currentLocation = undefined;
  state: State;
  currentLatency: number;
  currentJitter: number;
  currentDownload: number;
  currentUpload: number;
  hideRecommendation = 'd-none';
  recommendationColor = '';
  recommendation: string = "";
  recommendations: {
    [k in State]: {
      text: string,
      enabled: boolean,
    }
  };
  finalMessage: typeof this.messages[keyof typeof this.messages] = this.messages.default;

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {
    this.runTests();
  }

  resetVals() {
    this.latencyText = "0";
    this.jitterText = "0";
    this.downloadText = "00.00";
    this.uploadText = "00.00";
    this.progressValue = "1 1000";
    this.testCompleted = false;
    this.pingCount = 100;
    this.pingPacketsSent = [];
    this.pingPacketsRecieved = [];
    this.currentLocation = undefined;
    this.recommendations = {
      'Ping': { text: '', enabled: false, },
      'Download': { text: '', enabled: false, },
      'Upload': { text: '', enabled: false, },
    }
    this.finalMessage = this.messages.default;
  }

  getStateColor(state: State) {
    return {
      anchorGradientPurple: state === this.state && !this.testCompleted,
      offWhiteText: state !== this.state || this.testCompleted,
    };
  }

  getValueColor(state: State) {
    const recs = Object.entries(this.recommendations).filter((entry) => entry[1].enabled);
    return {
      'text-white': state === this.state && !this.testCompleted,
      'yellowGradient': recs.length === 1 && this.recommendations[state].enabled,
      'text-red': recs.length > 1,
    };
  }

  getCurrentTestValue(state: State) {
    switch (state) {
      case 'Ping':
        return this.latencyText;
      case 'Download':
        return this.downloadText;
      case 'Upload':
        return this.uploadText;
      default:
        return '';
    }
  }

  get latencyIcon() {
    return `assets/img/speed-test/latency${
      this.state === "Ping" && !this.testCompleted ? "-active" : ""
    }.svg`;
  }
  get jitterIcon() {
    return `assets/img/speed-test/jitter${
      this.state === "Ping" && !this.testCompleted ? "-active" : ""
    }.svg`;
  }
  get downloadIcon() {
    return `assets/img/speed-test/download${
      this.state === "Download" && !this.testCompleted ? "-active" : ""
    }.svg`;
  }
  get uploadIcon() {
    return `assets/img/speed-test/upload${
      this.state === "Upload" && !this.testCompleted ? "-active" : ""
    }.svg`;
  }

  updateRecommendations() {
    // RECOMMENDED : Latency of 15 ms, Jitter of 0.2 ms, Download Speed of 15 mbps, Upload Speed of 10 mbps
    // this.recommendations.Ping.enabled = true;
    // this.recommendations.Download.enabled = true;
    // this.recommendations.Upload.enabled = true;
    const recs = Object.entries(this.recommendations).filter((entry) => entry[1].enabled);
    if (recs.length === 1) {
      this.recommendation = 'Recommended ' + recs[0][1].text;
    } else if (recs.length) {
      this.recommendation = 'RECOMMENDED: ' + Object.entries(this.recommendations).map((entry) => entry[1].text).join(", ");
    } else {
      this.recommendation = "";
      this.recommendations = {
        'Ping': { text: '', enabled: false, },
        'Download': { text: '', enabled: false, },
        'Upload': { text: '', enabled: false, },
      }
    }
    this.hideRecommendation = recs.length === 0 ? 'd-none' : '';
    this.recommendationColor = 'recommendation ' + (recs.length !== 1 ? 'recommendation-red' : '');
  }

  async runTests() {
    this.resetVals();
    this.restService
      .getCurrentLocation()
      .toPromise()
      .then((v) => (this.currentLocation = v));
    // game servers use bitrate and hence bits
    // speed-test server user bytes.
    const res = await this.restService.getNearestSpeedTestServer().toPromise();
    // res.recommended_latency = 80;
    // res.recommended_download = 80 * 1000 * 1000;
    // res.recommended_upload = 80 * 1000 * 1000;
    const recommended_download_in_mbps = res.recommended_download / 1024 / 1024;
    const recommended_upload_in_mbps = res.recommended_upload / 1024 / 1024;
    this.recommendations.Ping.text = `Latency of ${res.recommended_latency} ms`;
    this.recommendations.Download.text = `Download Speed of ${recommended_download_in_mbps} mbps`;
    this.recommendations.Upload.text = `Upload Speed of ${recommended_upload_in_mbps} mbps`;
    this.state = "Ping";
    await this.runPing(res.ping);
    if (this.currentLatency > res.recommended_latency) {
      this.recommendations.Ping.enabled = true;
      this.updateRecommendations();
    }
    this.state = "Download";
    await this.runDL(res.download);
    if (this.currentDownload < recommended_download_in_mbps) {
      this.recommendations.Download.enabled = true;
      this.updateRecommendations();
    }
    this.state = "Upload";
    await this.runUL(res.upload);
    if (this.currentUpload < recommended_upload_in_mbps) {
      this.recommendations.Upload.enabled = true;
      this.updateRecommendations();
    }
    const recs = Object.entries(this.recommendations).filter((entry) => entry[1].enabled);
    if (recs.length) {
      if (recs.length === 1 && this.recommendations.Ping.enabled) {
        this.finalMessage = this.messages.stutter;
      } else {
        this.finalMessage = this.messages.not_optimal;
      }
    } else {
      this.finalMessage = this.messages.optimal;
    }
    this.progressValue = "660 1000";
    this.testCompleted = true;
  }

  runPing(url: string) {
    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      ws.onerror = () => {
        this._TsetLatencyText("");
        resolve(false);
      };
      ws.onopen = () => {
        for (let id = 0; id < this.pingCount; id++) {
          this.pingPacketsSent.push(+new Date());
          ws.send(JSON.stringify({ id, action: "ping" }));
        }
      };
      ws.onmessage = (e) => {
        if (typeof e.data === "string") {
          const data = JSON.parse(e.data);
          this.pingPacketsRecieved[data.id] = +new Date();
          if (this.pingPacketsRecieved.length === this.pingCount) {
            ws.close();
          }
        }
      };
      ws.onclose = () => {
        this.updatePingUI();
        resolve(true);
      };
    });
  }

  runDL(url: string) {
    return new Promise(async (resolve) => {
      let pcount = 0;
      let scount = 0;
      let dlstart = Date.now();
      for (let i = 1; i <= 20; i++) {
        fetch(url + `?nocache=${v4()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size: this.dlPacketsSize,
            id: 1,
          }),
        })
          .then(
            (res) => {
              if (res.status !== 200) return;
              scount++;
            },
            (err) => {
              console.warn(err, i);
            }
          )
          .finally(() => {
            pcount++;
            let s = (Date.now() - dlstart) / 1000;
            let t = (scount * this.dlPacketsSize) / 1024 / 1024 / s;
            this.currentDownload = (Math.floor(t * 100) / 100) * 8;
            this._TsetDownloadText(this.currentDownload);
            this.updateProgress(100 + pcount);
            if (pcount >= 20) {
              resolve(true);
            }
          });
      }
    });
  }

  runUL(url: string) {
    return new Promise(async (resolve) => {
      let pcount = 0;
      let scount = 0;
      let ulstart = Date.now();
      for (let i = 1; i <= 20; i++) {
        const formData = new FormData();
        formData.append("id", i.toString());
        formData.append("file", this.makePacket(i, this.ulPacketsSize));
        fetch(url + `?nocache=${v4()}`, {
          method: "POST",
          body: formData,
        })
          .then(
            (res) => {
              if (res.status !== 200) return;
              scount++;
            },
            (err) => {
              console.warn(err, i);
            }
          )
          .finally(() => {
            pcount++;
            let s = (Date.now() - ulstart) / 1000;
            let t = (scount * this.ulPacketsSize) / 1024 / 1024 / s;
            this.currentUpload = (Math.floor(t * 100) / 100) * 8;
            this._TsetUploadText(this.currentUpload);
            this.updateProgress(100 + 20 + pcount);
            if (pcount >= 20) {
              resolve(true);
            }
          });
      }
    });
  }
  // runDLo(url: string) {
  //   return new Promise((resolve) => {
  //     this.dlStartTime = Date.now();
  //     const ws = new WebSocket(url);
  //     ws.onerror = () => {
  //       this._TsetDownloadText("--");
  //       resolve(false);
  //     };
  //     ws.onmessage = (e) => {
  //       if (e.data instanceof Blob) {
  //         this.dlEndTime = Date.now();
  //         this.dlDataRecieved += e.data.size;
  //         this.dlPacketsCount++;
  //         if (this.dlPacketsCount >= this.ulPacketsCount) {
  //           ws.close();
  //         } else this.updateDLUI();
  //       }
  //     };
  //     ws.onclose = () => {
  //       this.dlEndTime = Date.now();
  //       this.updateDLUI();
  //       resolve(true);
  //     };
  //   });
  // }

  // runULo(url: string) {
  //   return new Promise((resolve) => {
  //     this.ulStartTime = +new Date();
  //     const ws = new WebSocket(url);
  //     ws.onerror = () => {
  //       this._TsetUploadText("--");
  //       resolve(false);
  //     };
  //     ws.onopen = () => {
  //       for (let id = 0; id < this.ulPacketsCount; id++) {
  //         const blob = this.makePacket(id, this.ulPacketsSize);
  //         ws.send(blob);
  //       }
  //     };
  //     ws.onmessage = (e) => {
  //       if (typeof e.data === "string") {
  //         this.ulEndTime = +new Date();
  //         this.ulPacketsConfirmed++;
  //         if (this.ulPacketsConfirmed >= this.ulPacketsCount) {
  //           ws.close();
  //         } else this.updateULUI();
  //       }
  //     };
  //     ws.onclose = () => {
  //       this.ulEndTime = +new Date();
  //       this.updateULUI();
  //       resolve(true);
  //     };
  //   });
  // }

  updatePingUI() {
    let l = 0;
    let j = 0;
    let lc = 0;
    let jc = 0;
    for (let id = 0; id < this.pingPacketsRecieved.length; id++) {
      if (typeof this.pingPacketsRecieved[id] === "number") {
        l += this.pingPacketsRecieved[id] - this.pingPacketsSent[id];
        let jt =
          this.pingPacketsRecieved[id] - this.pingPacketsRecieved[id - 1] || 0;
        if (jt) {
          j += jt;
          jc++;
        }
        lc++;
      }
    }
    if (lc) {
      this.currentLatency = Math.floor(l / lc);
      this._TsetLatencyText(this.currentLatency);
    }
    if (jc) {
      this.currentJitter = Math.floor(j / jc);
      this._TsetJitterText(this.currentJitter);
    }
    this.updateProgress(this.pingPacketsRecieved.length);
  }

  // updateDLUI() {
  //   let s = (this.dlEndTime - this.dlStartTime) / 1000;
  //   let t = this.dlDataRecieved / 1000 / 1000 / s;
  //   this._TsetDownloadText(Math.floor(t * 100) / 100);
  //   this.updateProgress(100 + this.dlPacketsCount);
  // }

  // updateULUI() {
  //   let s = (this.ulEndTime - this.ulStartTime) / 1000;
  //   let t = (this.ulPacketsConfirmed * this.ulPacketsSize) / 1000 / 1000 / s;
  //   this._TsetUploadText(Math.floor(t * 100) / 100);
  //   this.updateProgress(100 + this.dlPacketsCount + this.ulPacketsConfirmed);
  // }

  makePacket(id: number, size: number): Blob {
    const tag = JSON.stringify({ id });
    const mimeType = { type: "application/octet-stream" };
    return new Blob([tag, new ArrayBuffer(size - tag.length)], mimeType);
  }

  private printBlob(b: Blob) {
    let r = new FileReader();
    r.onload = () => console.warn(JSON.stringify(r.result));
    r.readAsText(b);
  }

  updateProgress(count: number) {
    // "1 1000" to "660 1000"
    const cp = (count / (this.pingCount + 40)) * 100;
    this._TsetProgressValue(`${Math.floor(cp * 6.6)} 1000`);
  }
}
