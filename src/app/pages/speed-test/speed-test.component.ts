import { Component, OnInit } from '@angular/core'
import { RestService } from 'src/app/services/rest.service'
import { throttle_to_latest as throttle } from 'src/app/utils/throttle.util'

@Component({
  selector: 'app-speed-test',
  templateUrl: './speed-test.component.html',
  styleUrls: ['./speed-test.component.scss']
})
export class SpeedTestComponent implements OnInit {
  latencyText = ""
  jitterText = ""
  downloadText = "00.00"
  uploadText = "00.00"
  progressValue = "1 1000"
  throttleTime = 40
  private _TsetLatencyText = throttle((v: string) => this.latencyText = v, this.throttleTime)
  private _TsetJitterText = throttle((v: string) => this.jitterText = v, this.throttleTime)
  private _TsetDownloadText = throttle((v: string) => this.downloadText = v, this.throttleTime)
  private _TsetUploadText = throttle((v: string) => this.uploadText = v, this.throttleTime)
  private _TsetProgressValue = throttle((v: string) => { this.progressValue = v }, this.throttleTime)

  pingCount = 100
  pingPacketsSent = []
  pingPacketsRecieved = []
  dlPacketsCount = 0
  dlDataRecieved = 0
  dlStartTime = 0
  dlEndTime = 0
  ulEndTime = 0
  ulStartTime = 0
  ulPacketsSize = 1365
  ulPacketsCount = 1024 * 20
  ulPacketsConfirmed = 0
  testCompleted = false

  getUrl(): string {
    return "localhost"
  }

  constructor(
    private readonly restService: RestService,
  ) {}

  ngOnInit(): void {
    this.runTests()
  }

  resetVals() {
    this.latencyText = ""
    this.jitterText = ""
    this.downloadText = "00.00"
    this.uploadText = "00.00"
    this.progressValue = "1 1000"
    this.testCompleted = false;
    this.pingCount = 100
    this.pingPacketsSent = []
    this.pingPacketsRecieved = []
    this.dlPacketsCount = 0
    this.dlDataRecieved = 0
    this.dlStartTime = 0
    this.dlEndTime = 0
    this.ulEndTime = 0
    this.ulStartTime = 0
    this.ulPacketsSize = 1365
    this.ulPacketsCount = 1024 * 20
    this.ulPacketsConfirmed = 0
    this.testCompleted = false
  }

  async runTests() {
    this.resetVals();
    const urls = await this.restService.getNearestSpeedTestServer().toPromise()
    await this.runPing(urls.ping)
    await this.runDL(urls.download)
    await this.runUL(urls.upload)
    this.progressValue = "660 1000"
    this.testCompleted = true;
  }

  runPing(url: string) {
    return new Promise((resolve) => {
      const ws = new WebSocket(url)
      ws.onerror = () => {
        this._TsetLatencyText("")
        resolve(false)
      }
      ws.onopen = () => {
        for (let id = 0; id < this.pingCount; id++) {
          this.pingPacketsSent.push(+new Date())
          ws.send(JSON.stringify({ id, action: "ping" }))
        }
      }
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data)
          this.pingPacketsRecieved[data.id] = +new Date()
          if (this.pingPacketsRecieved.length === this.pingCount) {
            ws.close()
          } else this.updatePingUI();
        }
      }
      ws.onclose = () => {
        this.updatePingUI()
        resolve(true)
      }
    })
  }

  runDL(url: string) {
    return new Promise((resolve) => {
      this.dlStartTime = +new Date()
      const ws = new WebSocket(url)
      ws.onerror = () => {
        this._TsetDownloadText("")
        resolve(false)
      }
      ws.onmessage = (e) => {
        if (typeof e.data === 'object') {
          this.dlEndTime = +new Date()
          this.dlDataRecieved += e.data.size
          this.dlPacketsCount++
          if (this.dlPacketsCount === this.ulPacketsCount) {
            ws.close()
          } else this.updateDLUI();
        }
      }
      ws.onclose = () => {
        this.dlEndTime = +new Date()
        this.updateDLUI()
        resolve(true)
      }
    })
  }

  runUL(url: string) {
    return new Promise((resolve) => {
      this.ulStartTime = +new Date()
      const ws = new WebSocket(url)
      ws.onerror = () => {
        this._TsetUploadText("--")
        resolve(false)
      }
      ws.onopen = () => {
        for (let id = 0; id < this.ulPacketsCount; id++) {
          const blob = this.makePacket(id, this.ulPacketsSize);
          ws.send(blob)
        }
      }
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          this.ulEndTime = +new Date();
          this.ulPacketsConfirmed++
          if (this.ulPacketsConfirmed === this.ulPacketsCount) {
            ws.close()
          } else this.updateULUI();
        }
      }
      ws.onclose = () => {
        this.ulEndTime = +new Date();
        this.updateULUI()
        resolve(true)
      }
    })
  }

  updatePingUI() {
    let l = 0
    let j = 0
    let lc = 0
    let jc = 0
    for (let id = 0; id < this.pingPacketsRecieved.length; id++) {
      if (typeof this.pingPacketsRecieved[id] === 'number') {
        l += this.pingPacketsRecieved[id] - this.pingPacketsSent[id]
        let jt = (this.pingPacketsRecieved[id] - this.pingPacketsRecieved[id - 1]) || 0
        if (jt) {
          j += jt
          jc++
        }
        lc++
      }
    }
    lc && this._TsetLatencyText(Math.floor(l / lc))
    jc && this._TsetJitterText(Math.floor(j / jc))
    this.updateProgress(this.pingPacketsRecieved.length)
  }

  updateDLUI() {
    let s = (this.dlEndTime - this.dlStartTime) / 1000;
    let t = (this.dlDataRecieved / 1024 / 1024 / s)
    this._TsetDownloadText(Math.floor(t*100)/100)
    this.updateProgress(100 + this.dlPacketsCount)
  }

  updateULUI() {
    let s = (this.ulEndTime - this.ulStartTime) / 1000;
    let t = ((this.ulPacketsConfirmed * this.ulPacketsSize) / 1024 / 1024 / s)
    this._TsetUploadText(Math.floor(t*100)/100)
    this.updateProgress(100 + this.dlPacketsCount + this.ulPacketsConfirmed)
  }

  makePacket(id: number, size: number): Blob {
    const tag = JSON.stringify({ id })
    const mimeType = { type: "application/octet-stream" };
    return new Blob([tag, new ArrayBuffer(size - tag.length)], mimeType);
  }

  private printBlob(b: Blob) {
    let r = new FileReader();
    r.onload = () => console.warn(JSON.stringify(r.result));
    r.readAsText(b);
  }

  updateProgress(count: number) {
    // 1 1000 to 660 1000
    const cp = (count / (this.pingCount + (2 * this.ulPacketsCount))) * 100;
    this._TsetProgressValue(`${Math.floor(cp * 6.6)} 1000`)
  }
}
