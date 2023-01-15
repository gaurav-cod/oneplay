import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

declare const runGamepad: Function;

function getPosition(index: number) {
  switch (index) {
    case 0:
      return "1st";
    case 1:
      return "2nd";
    case 2:
      return "3rd";
    default:
      return `${index + 1}th`;
  }
}

type Message = { text: string; color: string };

@Injectable({
  providedIn: "root",
})
export class GamepadService {
  private readonly _$gamepads: BehaviorSubject<Gamepad[]> = new BehaviorSubject(
    []
  );
  private readonly _$message: BehaviorSubject<Message | null> =
    new BehaviorSubject(null);
  private connectivityInterval: number;
  private firstGamepad: Gamepad;

  get gamepads() {
    return this._$gamepads.asObservable();
  }

  get message() {
    return this._$message.asObservable();
  }

  init() {
    const gamepads = navigator.getGamepads().filter((g) => !!g);
    const standardGamepads = gamepads.filter((g) => g.mapping === "standard");
    const nonStandardGamepads = gamepads.filter(
      (g) => g.mapping !== "standard"
    );
    if (standardGamepads.length > 0) {
      this._$gamepads.next(standardGamepads);
      standardGamepads.forEach((g) => this.vibrateGamepad(g));
      this._$message.next({
        text: `${standardGamepads.length} gamepads connected!`,
        color: "success",
      });
    }
    if (nonStandardGamepads.length > 0) {
      this._$message.next({
        text: `Please connect your ${nonStandardGamepads
          .map((g) => getPosition(g.index))
          .join(", ")} gamepads in Windows mode.`,
        color: "warning",
      });
    }
    window.addEventListener("gamepadconnected", (e) => this.connectGamepad(e));
    window.addEventListener("gamepaddisconnected", (e) =>
      this.disconnectGamepad(e)
    );
  }

  destroy() {
    window.removeEventListener("gamepadconnected", (e) =>
      this.connectGamepad(e)
    );
    window.removeEventListener("gamepaddisconnected", (e) =>
      this.disconnectGamepad(e)
    );
  }

  nullifyMessage() {
    this._$message.next(null);
  }

  vibrateGamepad(gamepad: any, duration = 200) {
    gamepad.vibrationActuator?.playEffect("dual-rumble", {
      startDelay: 0,
      duration,
      weakMagnitude: 1.0,
      strongMagnitude: 1.0,
    });
  }

  private connectGamepad(event: GamepadEvent) {
    if (event.gamepad.mapping !== "standard") {
      this._$message.next({
        text: "Please connect your gamepad in Windows mode.",
        color: "warning",
      });
    } else {
      this.vibrateGamepad(event.gamepad);
      this.firstGamepad = navigator.getGamepads()[0];
      if (!this.connectivityInterval) {
        this.connectivityInterval = setInterval(runGamepad, 100);
      }
      this.updateGamepads(event.gamepad, "connected");
    }
  }

  private disconnectGamepad(event: GamepadEvent) {
    if (event.gamepad.mapping === "standard") {
      if (event.gamepad.index === this.firstGamepad?.index) {
        clearInterval(this.connectivityInterval);
        this.connectivityInterval = 0;
      }
      this.updateGamepads(event.gamepad, "disconnected");
    }
  }

  private updateGamepads(
    gamepad: Gamepad,
    event: "connected" | "disconnected"
  ) {
    this._$message.next({
      text: `${getPosition(gamepad.index)} gamepad ${event} : ${gamepad.id}`,
      color: event === "connected" ? "success" : "danger",
    });
    this._$gamepads.next(
      navigator.getGamepads().filter((g) => !!g && g.mapping === "standard")
    );
  }
}
