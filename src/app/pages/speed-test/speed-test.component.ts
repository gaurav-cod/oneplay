import { Component, OnInit } from '@angular/core'
import { throttle_to_latest as throttle } from 'src/app/utils/throttle.util'

@Component({
  selector: 'app-speed-test',
  templateUrl: './speed-test.component.html',
  styleUrls: ['./speed-test.component.scss']
})
export class SpeedTestComponent implements OnInit {
  private _latencyText = "--"
  private _jitterText = "--"
  private _downloadText = "--"
  private _uploadText = "--"
  private _TlatencyText = throttle((v: string) => this._latencyText = v)
  private _TjitterText = throttle((v: string) => this._jitterText = v)
  private _TdownloadText = throttle((v: string) => this._downloadText = v)
  private _TuploadText = throttle((v: string) => this._uploadText = v)

  pingCount = 100
  pingPacketsSent = []
  pingPacketsRecieved = []
  dlPacketsCount = 0
  dlDataRecieved = 0
  dlStartTime = 0
  dlEndTime = 0
  ulStartTime = 0
  ulPacketsSent = []
  ulPacketsRecieved = []
  ulPacketsSize = 1365
  ulPacketsCount = 24 * 2

  public get latencyText(): string {
    return this._latencyText
  }

  public get jitterText(): string {
    return this._jitterText
  }

  public get downloadText(): string {
    return this._downloadText
  }

  public get uploadText(): string {
    return this._uploadText
  }

  public set latencyText(v: string) {
    this._TlatencyText(v)
  }

  public set jitterText(v: string) {
    this._TjitterText(v);
  }

  public set downloadText(v: string) {
    this._TdownloadText(v);
  }

  public set uploadText(v: string) {
    this._TuploadText(v);
  }

  getUrl(): string {
    return "localhost"
  }

  ngOnInit(): void {
    this.runSequence()
  }

  async runSequence() {
    await this.runPing()
    await this.runDL()
    await this.runUL()
  }

  runPing() {
    return new Promise((resolve) => {
      const url = "ws://" + this.getUrl() + ":8001/v1/test/ping"
      const ws = new WebSocket(url)
      ws.onerror = () => {
        this.latencyText = "--"
        resolve(false)
      }
      ws.onopen = () => {
        // todo: take ping every one second for 10 seconds?
        for (let id = 0; id < this.pingCount; id++) {
          this.pingPacketsSent.push(+new Date())
          ws.send(JSON.stringify({ id, action: "ping" }))
        }
      }
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data)
          this.pingPacketsRecieved[data.id] = +new Date()
          // this.updatePingUI()
        }
      }
      ws.onclose = () => {
        this.updatePingUI()
        resolve(true)
      }
    })
  }

  runDL() {
    return new Promise((resolve) => {
      this.dlStartTime = +new Date()
      const url = "ws://" + this.getUrl() + ":8001/v1/test/download"
      const ws = new WebSocket(url)
      ws.onerror = () => {
        this.downloadText = "--"
        resolve(false)
      }
      ws.onmessage = (e) => {
        if (typeof e.data === 'object') {
          // this.dlEndTime = +new Date()
          this.dlDataRecieved += e.data.size
          this.dlPacketsCount++
          // this.updateDLUI()
        }
      }
      ws.onclose = () => {
        this.dlEndTime = +new Date()
        this.updateDLUI()
        resolve(true)
      }
    })
  }

  runUL() {
    return new Promise((resolve) => {
      this.ulStartTime = +new Date()
      const url = "ws://" + this.getUrl() + ":8001/v1/test/upload"
      const ws = new WebSocket(url)
      ws.onerror = () => {
        this.uploadText = "--"
        resolve(false)
      }
      ws.onopen = () => {
        const blob = new Blob([new ArrayBuffer(this.ulPacketsSize)], { type: "application/octet-stream" })
        for (let id = 0; id < this.ulPacketsCount; id++) {
          this.ulPacketsSent[id] = +new Date()
          ws.send(JSON.stringify({ id, blob }))
        }
      }
      ws.onmessage = (e) => {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data)
          this.ulPacketsRecieved[data.id] = +new Date()
          // this.updateULUI()
          // if (this.ulPacketsRecieved.length === this.ulPacketsCount) {
          //   ws.close()
          // }
        }
      }
      ws.onclose = () => {
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
    // console.warn('sent:', this.pingPacketsSent.length, 'got:', lc, 'lost:', this.pingPacketsSent.length - lc)
    this.latencyText = (Math.floor(l / lc) || '--').toString()
    this.jitterText = (Math.floor(j / jc) || '--').toString()
  }

  updateDLUI() {
    let s = (this.dlEndTime - this.dlStartTime) / 1000 //time taken in seconds
    // todo: if less than 1 MBps switch to KBps?
    let t = (this.dlDataRecieved / 1024 / 1024 / s).toString().split(".")
    // console.warn(this.dlDataRecieved / 1024 / 1024 / s, t, '<- dl')
    if (t.length === 1) this.downloadText = t[0] + ' MB/s'
    else this.downloadText = t[0] + '.' + t[1].substring(0, 2) + ' MB/s'
    // console.warn(this.dlPacketsCount, this.dlDataRecieved, s)
  }

  updateULUI() {
    let t = 0
    let c = 0
    // console.warn(this.ulPacketsSent, this.ulPacketsRecieved, this.ulPacketsCount)
    for (let i = 0; i < this.ulPacketsRecieved.length; i++) {
      if (typeof this.ulPacketsRecieved[i] === 'number') {
        let time = this.ulPacketsRecieved[i] - this.ulPacketsSent[i]
        if (time) {
          t += time
          c++
        }
      }
    }
    //todo: KBps MBps GBps
    let s = (((c * this.ulPacketsSize) / 1024 / 1024 / t / 1000) || 0).toString().split(".")
    if (s.length === 1) this.uploadText = s[0] + ' Mbps'
    else this.uploadText = s[0] + '.' + s[1].substring(0, 2) + ' Mb/s'
    // console.warn(c, s, t, '<- ul')
  }

  private printBlob(b: Blob) {
    let r = new FileReader();
    r.onload = () => console.warn(JSON.stringify(r.result));
    r.readAsText(b);
  }

}
