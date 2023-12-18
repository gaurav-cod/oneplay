import { Injectable } from "@angular/core";
import { MessagePayload } from "firebase/messaging";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private _$notificationCount: BehaviorSubject<number | null> =
    new BehaviorSubject(null);
  private _$notifications: BehaviorSubject<MessagePayload[] | null> =
    new BehaviorSubject(null);

  get notificationCount() {
    return this._$notificationCount.asObservable();
  }

  setNotificationCount(value: number) {
    this._$notificationCount.next(value);
  }

  get notifications() {
    return this._$notifications.asObservable();
  }

  addNotification(message: MessagePayload) {
    let notifications = this._$notifications.value;
    if (!notifications) {
      notifications = [];
    }
    this._$notifications.next([...notifications, message]);
  }

  removeNotification(index: number) {
    this._$notifications.next(
      this._$notifications.value.filter((_, idx) => idx !== index)
    );
  }
}
