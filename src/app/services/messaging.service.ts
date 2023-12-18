import { Injectable } from "@angular/core";
import {
  deleteToken,
  getMessaging,
  getToken,
  MessagePayload,
  Messaging,
  onMessage,
} from "firebase/messaging";
import { initializeApp } from "firebase/app";
import { BehaviorSubject } from "rxjs";
import { RestService } from "./rest.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class MessagingService {
  currentMessage: BehaviorSubject<MessagePayload | null> = new BehaviorSubject(
    null
  );
  messaging: Messaging;

  constructor(private readonly restService: RestService) {
    const app = initializeApp(environment.firebase);
    this.messaging = getMessaging(app);
  }

  requestToken() {
    getToken(this.messaging)
      .then((token) => {
        console.log("Token received. ", token);
        this.restService.addDevice(token).toPromise();
      })
      .catch((err) => {
        console.log("Unable to get permission to notify.", err);
      });
  }

  receiveMessage() {
    onMessage(this.messaging, (payload) => {
      console.log("Message received. ", payload);
      this.currentMessage.next(payload);
    });
  }

  async removeToken() {
    try {
      const token = await getToken(this.messaging);
      await deleteToken(this.messaging);
      await this.restService.deleteDevice(token).toPromise();
    } catch (err) {
      console.log("Unable to get permission to notify.", err);
    }
  }
}
