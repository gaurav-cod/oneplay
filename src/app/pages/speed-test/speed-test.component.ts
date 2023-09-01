import { Component, OnInit } from "@angular/core";
import { RestService } from "src/app/services/rest.service";
import { throttle_to_latest as throttle } from "src/app/utils/throttle.util";

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
  throttleTime = 40;
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
  dlPacketsCount = 0;
  dlDataRecieved = 0;
  dlStartTime = 0;
  dlEndTime = 0;
  ulEndTime = 0;
  ulStartTime = 0;
  ulPacketsSize = 5242880;
  ulPacketsCount = 100;
  ulPacketsConfirmed = 0;
  testCompleted = false;
  currentLocation = undefined;
  state: State;
  currentLatency: number;
  currentJitter: number;
  currentDownload: number;
  currentUpload: number;
  recommendation: string = "";
  recommendations: {
    type: State,
    text: string,
  }[] = [];
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
    this.dlPacketsCount = 0;
    this.dlDataRecieved = 0;
    this.dlStartTime = 0;
    this.dlEndTime = 0;
    this.ulEndTime = 0;
    this.ulStartTime = 0;
    this.ulPacketsSize = 4194304;
    this.ulPacketsCount = 100;
    this.ulPacketsConfirmed = 0;
    this.testCompleted = false;
    this.currentLocation = undefined;
    this.recommendations = [];
    this.finalMessage = this.messages.default;
  }

  getStateColor(state: State) {
    return {
      anchorGradientPurple: state === this.state && !this.testCompleted,
      offWhiteText: state !== this.state || this.testCompleted,
    };
  }

  getValueColor(state: State) {
    return {
      'text-white': state === this.state && !this.testCompleted,
      'yellowGradient': this.recommendations.length === 1 && this.recommendations[0].type === state,
      'text-red': this.recommendations.length > 1 && this.recommendations.find((v) => v.type === state) !== undefined,
    };
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
    if (this.recommendations.length) {
      if (this.recommendations.length === 1) {
        this.recommendation = 'Recommended ' + this.recommendations[0].text;
      } else {
        this.recommendation = 'RECOMMENDED: ' + this.recommendations.map(v => v.text).join(", ");
      }
    } else {
      this.recommendation = "";
      this.recommendations = [];
      this.finalMessage = this.messages.default;
    }
  }

  async runTests() {
    this.resetVals();
    this.restService
      .getCurrentLocation()
      .toPromise()
      .then((v) => (this.currentLocation = v));
    const res = await this.restService.getNearestSpeedTestServer().toPromise();
    // res.recommended_latency = 10;
    // res.recommended_download = 10 * 1000 * 1000;
    // res.recommended_upload = 80 * 1000 * 1000;
    this.state = "Ping";
    await this.runPing(res.ping);
    if (this.currentLatency > res.recommended_latency) {
      this.recommendations.push({
        type: 'Ping',
        text: `Latency of ${res.recommended_latency} ms`,
      })
      this.updateRecommendations();
    }
    this.state = "Download";
    await this.runDL(res.download);
    const recommended_download_in_mbps = res.recommended_download / 1000 / 1000;
    if (this.currentDownload < recommended_download_in_mbps) {
      this.recommendations.push({
        type: 'Download',
        text: `Download Speed of ${recommended_download_in_mbps} mbps`,
      })
      this.updateRecommendations();
    }
    this.state = "Upload";
    await this.runUL(res.upload);
    const recommended_upload_in_mbps = res.recommended_upload / 1000 / 1000;
    if (this.currentUpload < recommended_upload_in_mbps) {
      this.recommendations.push({
        type: 'Upload',
        text: `Upload Speed of ${recommended_upload_in_mbps} mbps`,
      })
      this.updateRecommendations();
    }
    if (this.recommendations.length) {
      if (this.recommendations.length === 1 && this.currentLatency > res.recommended_latency) {
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
      let count = 0;
      let dldata = 0;
      let dlend = Date.now();
      let dlstart = Date.now();
      for (let i = 1; i <= 20; i++) {
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            size: 1000000 * i,
            id: 1,
          }),
        })
          .then(
            (res) => {
              if (res.status !== 200) return;
              dldata += 1000000 * i;
            },
            (err) => {
              console.warn(err, i);
            }
          )
          .finally(() => {
            count++;
            dlend = Date.now();
            let s = (dlend - dlstart) / 1000;
            let t = dldata / 1000 / 1000 / s;
            this.currentDownload = (Math.floor(t * 100) / 100) * 8;
            this._TsetDownloadText(this.currentDownload);
            this.updateProgress(100 + count);
            if (count >= 20) {
              resolve(true);
            }
          });
      }
    });
  }

  runUL(url: string) {
    return new Promise(async (resolve) => {
      let count = 0;
      let uldata = 0;
      let ulend = Date.now();
      let ulstart = Date.now();
      for (let i = 1; i <= 20; i++) {
        const formData = new FormData();
        formData.append("id", i.toString());
        formData.append("file", this.makePacket(i, 1000000 * i));
        fetch(url, {
          method: "POST",
          body: formData,
        })
          .then(
            (res) => {
              if (res.status !== 200) return;
              uldata += 1000000 * i;
            },
            (err) => {
              console.warn(err, i);
            }
          )
          .finally(() => {
            count++;
            ulend = Date.now();
            let s = (ulend - ulstart) / 1000;
            let t = uldata / 1000 / 1000 / s;
            this.currentUpload = (Math.floor(t * 100) / 100) * 8;
            this._TsetUploadText(this.currentUpload);
            this.updateProgress(100 + 20 + count);
            if (count >= 20) {
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
