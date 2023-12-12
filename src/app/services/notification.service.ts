import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class NotificationService {
    private _$notificationCount: BehaviorSubject<number | null> =
        new BehaviorSubject(null);


    get notificationCount() {
        return this._$notificationCount.asObservable();
    }

    setNotificationCount(value: number) {
        this._$notificationCount.next(value);
    }
}
