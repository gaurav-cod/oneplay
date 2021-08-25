export class PC {
  readonly ipv4: string;
  readonly isConsoleActive: boolean;
  readonly isRunning: boolean;
  readonly launchStartTime: Date | null;
  readonly timeAllocated: number;
  readonly timeUsage: number;
  readonly message: string;
  readonly password: string;
  readonly state: "running" | "stopped";

  constructor(json: { [key: string]: any }) {
    this.ipv4 = json["ipv4"];
    this.isConsoleActive = json["is_console_active"];
    this.isRunning = json["is_running"];
    this.launchStartTime = !!json["launch_start_time"]
      ? new Date(json["launch_start_time"] * 1000)
      : null;
    this.timeAllocated = json["total_time_allocated"];
    this.timeUsage = json["total_usage_time"];
    this.message = json["msg"];
    this.password = json["password"];
    this.state = json["state"];
  }

  copyWith(pc: Partial<PC>): PC {
    return {
      ...this,
      ...pc,
      copyWith: this.copyWith
    };
  }
}
