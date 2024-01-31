import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { throttle_to_latest as throttle } from "src/app/utils/throttle.util";
import { v4 } from "uuid";
import Swal from "sweetalert2";

type State = "Latency" | "Download" | "Upload";

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
      class: "",
      text: "",
    },
    optimal: {
      class: "primaryGradientColor",
      text: "Your network is optimal for streaming",
    },
    not_optimal: {
      class: "errorGradientColor",
      text: "Network conditions are not optimal for streaming",
    },
    stutter: {
      class: "yellowGradient",
      text: "You may experience stutter of high latency",
    },
  };
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
  private subs: Subscription[] = [];
  private componentActive: boolean;

  pingCount = 150;
  pingPacketsSent = [];
  pingPacketsRecieved = [];
  dlReqCount = 40;
  ulReqCount = 80;
  dlPacketsSize = 4000000;
  ulPacketsSize = 1050000;
  testCompleted = false;
  currentLocation = undefined;
  state: State;
  currentLatency: number;
  currentJitter: number;
  currentDownload: number;
  currentUpload: number;
  hideRecommendation = "d-none";
  recommendationColor = "";
  recommendation: string = "";
  recommendations: {
    [k in State]: {
      text: string;
      enabled: boolean;
    };
  };
  finalMessage: (typeof this.messages)[keyof typeof this.messages] =
    this.messages.default;

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.componentActive = true;
    this.title.setTitle("Speed Test");
    if (this.authService.trigger_speed_test) {
      this.authService.trigger_speed_test = false;
    }
    this.runTests();
  }

  ngOnDestroy() {
    this.componentActive = false;
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  resetVals() {
    this.latencyText = "0";
    this.jitterText = "0";
    this.downloadText = "00.00";
    this.uploadText = "00.00";
    this.progressValue = "1 1000";
    this.testCompleted = false;
    this.pingPacketsSent = [];
    this.pingPacketsRecieved = [];
    this.currentLocation = undefined;
    this.recommendations = {
      Latency: { text: "", enabled: false },
      Download: { text: "", enabled: false },
      Upload: { text: "", enabled: false },
    };
    this.finalMessage = this.messages.default;
    this.hideRecommendation = "d-none";
    this.recommendationColor = "recommendation";
    this.subs.forEach((sub) => sub.unsubscribe());
    this.subs = [];
  }

  getStateColor(state: State) {
    return {
      anchorGradientPurple: state === this.state && !this.testCompleted,
      offWhiteText: state !== this.state || this.testCompleted,
    };
  }

  getValueColor(state: State) {
    const recs = Object.entries(this.recommendations).filter(
      (entry) => entry[1].enabled
    );
    return {
      "text-white": state === this.state && !this.testCompleted,
      yellowGradient: recs.length === 1 && this.recommendations[state].enabled,
      "text-red": recs.length > 1,
    };
  }

  getCurrentTestValue(state: State) {
    switch (state) {
      case "Latency":
        return this.latencyText;
      case "Download":
        return this.downloadText;
      case "Upload":
        return this.uploadText;
      default:
        return "";
    }
  }

  get latencyIcon() {
    return `assets/img/speed-test/latency${
      this.state === "Latency" && !this.testCompleted ? "-active" : ""
    }.svg`;
  }
  get jitterIcon() {
    return `assets/img/speed-test/jitter${
      this.state === "Latency" && !this.testCompleted ? "-active" : ""
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
    const recs = Object.entries(this.recommendations).filter(
      (entry) => entry[1].enabled
    );
    if (recs.length === 1) {
      this.recommendation = "Recommended " + recs[0][1].text;
    } else if (recs.length) {
      this.recommendation =
        "RECOMMENDED: " + recs.map((entry) => entry[1].text).join(", ");
    } else {
      this.recommendation = "";
      this.recommendations = {
        Latency: { text: "", enabled: false },
        Download: { text: "", enabled: false },
        Upload: { text: "", enabled: false },
      };
    }
    this.hideRecommendation = recs.length === 0 ? "d-none" : "";
    this.recommendationColor =
      "recommendation " + (recs.length !== 1 ? "recommendation-red" : "");
  }

  async runTests() {
    this.resetVals();
    this.restService
      .getCurrentLocation()
      .toPromise()
      .then((v) => (this.currentLocation = v)).catch((error)=> {
        this.showError(error);
      });
      try {
        if (!this.componentActive) return;
        const res = await this.restService.getNearestSpeedTestServer().toPromise();
     
        const recommended_download_in_mbps = res.recommended_download / 1000;
        const recommended_upload_in_mbps = res.recommended_upload / 1000;
        this.recommendations.Latency.text = `Latency of ${res.recommended_latency} ms`;
        this.recommendations.Download.text = `Download Speed of ${recommended_download_in_mbps} mbps`;
        this.recommendations.Upload.text = `Upload Speed of ${recommended_upload_in_mbps} mbps`;
        this.state = "Latency";
        await new Promise<void>((res) => setTimeout(() => res(), 2000));
        if (!this.componentActive) return;
        await this.runPing(res.ping);
        if (this.currentLatency > res.recommended_latency) {
          this.recommendations.Latency.enabled = true;
          this.updateRecommendations();
        }
        this.state = "Download";
        await new Promise<void>((res) => setTimeout(() => res(), 1000));
        if (!this.componentActive) return;
        await this.runDL(res.download);
        if (this.currentDownload < recommended_download_in_mbps) {
          this.recommendations.Download.enabled = true;
          this.updateRecommendations();
        }
        this.state = "Upload";
        await new Promise<void>((res) => setTimeout(() => res(), 1000));
        if (!this.componentActive) return;
        await this.runUL(res.upload);
        if (this.currentUpload < recommended_upload_in_mbps) {
          this.recommendations.Upload.enabled = true;
          this.updateRecommendations();
        }
        const recs = Object.entries(this.recommendations).filter(
          (entry) => entry[1].enabled
        );
        if (recs.length) {
          if (recs.length === 1 && this.recommendations.Latency.enabled) {
            this.finalMessage = this.messages.stutter;
          } else {
            this.finalMessage = this.messages.not_optimal;
          }
        } else {
          this.finalMessage = this.messages.optimal;
        }
        this.progressValue = "660 1000";
        this.testCompleted = true;
      } catch(error) {
        this.showError(error);
      }
  }

  runPing(url: string) {
    return new Promise((resolve) => {
      const ws = new WebSocket(url);
      ws.onerror = () => {
        this._TsetLatencyText("");
        resolve(false);
      };
      ws.onopen = () => {
        this.pingPacketsSent.push(+new Date());
        ws.send(JSON.stringify({ id: 0, action: "ping" }));
      };
      ws.onmessage = (e) => {
        if (!this.componentActive) return resolve(false);
        if (typeof e.data === "string") {
          const data = JSON.parse(e.data);
          this.pingPacketsRecieved[+data.id] = +new Date();
          if (this.pingPacketsRecieved.length === this.pingCount) {
            ws.close();
          } else {
            this.updatePingUI();
            setTimeout(() => {
              this.pingPacketsSent.push(+new Date());
              ws.send(JSON.stringify({ id: +data.id + 1, action: "ping" }));
            }, 20);
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
      this.currentDownload = 0;
      for (let i = 1; i <= this.dlReqCount; i++) {
        if (!this.componentActive) return resolve(false);
        this.subs.push(this.restService.sendSpeedTestDLPacket(
          url + `?nocache=${v4()}`,
          this.dlPacketsSize,
        ).subscribe({
          complete: () => {
            scount++;
            pcount++;
            let s = (Date.now() - dlstart) / 1000;
            let t = (scount * this.dlPacketsSize) / 1024 / 1024 / s;
            this.currentDownload = (Math.floor(t * 100) / 100) * 8;
            this._TsetDownloadText(this.currentDownload);
            this.updateProgress(this.pingCount + pcount);
            if (pcount >= this.dlReqCount) {
              resolve(true);
            }
          },
        }));
      }
      setTimeout(() => {
        if (pcount < this.dlReqCount) {
          this.updateProgress(this.pingCount + this.dlReqCount);
          resolve(true);
        }
      }, 30000);
    });
  }

  runUL(url: string) {
    return new Promise(async (resolve) => {
      let pcount = 0;
      let scount = 0;
      let ulstart = Date.now();
      this.currentUpload = 0;
      for (let i = 1; i <= this.ulReqCount; i++) {
        if (!this.componentActive) return resolve(false);
        this.subs.push(this.restService.sendSpeedTestULPacket(
          url + `?nocache=${v4()}`, i.toString(),
          this.makePacket(i, this.ulPacketsSize),
        ).subscribe({
          complete: () => {
            scount++;
            pcount++;
            let s = (Date.now() - ulstart) / 1000;
            let t = (scount * this.ulPacketsSize) / 1024 / 1024 / s;
            this.currentUpload = (Math.floor(t * 100) / 100) * 8;
            this._TsetUploadText(this.currentUpload);
            this.updateProgress(this.pingCount + this.dlReqCount + pcount);
            if (pcount >= this.ulReqCount) {
              resolve(true);
            }
          },
        }));
      }

      setTimeout(() => {
        if (pcount < this.ulReqCount) {
          this.updateProgress(this.pingCount + this.dlReqCount + this.ulReqCount);
          resolve(true);
        }
      }, 30000);
    });
  }

  updatePingUI() {
    const latencies: number[] = [];
    for (let id = 0; id < this.pingPacketsRecieved.length; id++) {
      latencies.push(this.pingPacketsRecieved[id] - this.pingPacketsSent[id]);
    }
    this.currentLatency = +(
      latencies.reduce((total, latency) => total + latency, 0) /
      latencies.length
    ).toFixed(2);
    this.currentJitter = +latencies
      .reduce(
        (jitter, latency, index, latencies) =>
          index === 0
            ? 0
            : jitter + (Math.abs(latencies[index - 1] - latency) - jitter) / 16,
        0
      )
      .toFixed(2);
    if (this.currentLatency) {
      this._TsetLatencyText(this.currentLatency);
    }
    if (this.currentJitter) {
      this._TsetJitterText(this.currentJitter);
    }
    this.updateProgress(this.pingPacketsRecieved.length);
  }

  makePacket(id: number, size: number): Blob {
    const tag = JSON.stringify({ id });
    const mimeType = { type: "application/octet-stream" };
    return new Blob([tag, new ArrayBuffer(size - tag.length)], mimeType);
  }

  updateProgress(count: number) {
    // "1 1000" to "660 1000"
    const cp =
      (count / (this.pingCount + this.dlReqCount + this.ulReqCount)) * 100;
    this._TsetProgressValue(`${Math.floor(cp * 6.6)} 1000`);
  }

  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    })
  }
}
