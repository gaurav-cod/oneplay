import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class NotificationService {
    private _$notificationCount: BehaviorSubject<number | null> = new BehaviorSubject(null);
    private _$showAlertNotification: BehaviorSubject<boolean> = new BehaviorSubject(true);


    get notificationCount() {
        return this._$notificationCount.asObservable();
    }

    setNotificationCount(value: number) {
        this._$notificationCount.next(value);
    }

    get showAlertNotification() {
        return this._$showAlertNotification.asObservable();
    }
    setShowAlertNotification(value: boolean) {
        this._$showAlertNotification.next(value);
    }
}
