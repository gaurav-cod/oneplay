import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { GameStatusRO } from "../interface";

@Injectable({
  providedIn: "root",
})
export class GameService {
  private _$gameStatus: BehaviorSubject<GameStatusRO | null> =
    new BehaviorSubject(null);

  get gameStatus() {
    return this._$gameStatus.asObservable();
  }

  set gameStatus(value: Observable<GameStatusRO | null>) {
    value.subscribe((data) => this._$gameStatus.next(data));
  }
}
