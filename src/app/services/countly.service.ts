import { Injectable } from "@angular/core";
import { v4 } from "uuid";
import { RestService } from "./rest.service";
import { CountlyEventData, CustomSegments, StartEvent } from "./countly";
import Countly from "countly-sdk-web";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import Cookies from "js-cookie";
import * as moment from "moment";

@Injectable({
  providedIn: "root",
})
export class CountlyService {
  private countly_prefix_key = "x_countly_event_key";
  private data_postfix = " - data";

  constructor(private readonly authService: AuthService) {
    let deviceId = Cookies.get("countly_device_id");
    const userId = this.authService.userIdAndToken?.userid;
    let newDeviceId: string | null = null;

    if (userId && !deviceId) {
      deviceId = userId;
      this.setDeviceId(deviceId);
    } else if (userId && deviceId !== userId) {
      newDeviceId = userId;
    } else if (!userId && !deviceId) {
      deviceId = v4();
      this.setDeviceId(deviceId);
    }

    Countly.init({
      debug: !environment.production,
      app_key: environment.countly.key,
      url: environment.countly.url,
      device_id: deviceId,
      heatmap_whitelist: [environment.domain],
      app_version: environment.appVersion,
    });

    if (newDeviceId) {
      deviceId = newDeviceId;
      Countly.change_id(newDeviceId);
      this.setDeviceId(newDeviceId);
    }

    Countly.track_sessions();
    Countly.track_clicks();
    Countly.track_scrolls();
    Countly.track_errors();
    Countly.track_links();
    Countly.collect_from_forms();
    Countly.track_forms();

    this.authService.user.subscribe((user) => {
      if (user) {
        if (user.id !== deviceId) {
          deviceId = user.id;
          Countly.change_id(user.id);
          this.setDeviceId(user.id);
        }
        Countly.user_details({
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          picture: user.photo,
          gender: user.gender,
        });
      }
    });
  }

  private setDeviceId(deviceId: string) {
    Cookies.set("countly_device_id", deviceId, {
      domain: environment.cookie_domain,
      path: "/",
      expires: moment().add(90, "days").toDate(),
    });
  }

  private add_event = (data: CountlyEventData): void => Countly.add_event(data);

  track_pageview = (url: string): void => Countly.track_pageview(url);

  addEvent<T extends keyof CustomSegments>(
    event: T,
    segments: CustomSegments[T]
  ) {
    segments.channel = "web";
    this.add_event({ key: event, segmentation: segments });
  }

  startEvent<T extends keyof CustomSegments>(
    event: T,
    {
      unique,
      data,
    }: { unique?: boolean; data?: Partial<CustomSegments[T]> } = {}
  ): StartEvent<T> {
    localStorage.setItem(this.keyOfKey(event), `${+new Date()}`);
    if (data && (!localStorage.getItem(event + this.data_postfix) || unique))
      localStorage.setItem(
        this.keyOfKey(event + this.data_postfix),
        JSON.stringify(data)
      );
    return {
      data,
      cancel: () => this.cancelEvent(event),
      end: (segments: Partial<CustomSegments[T]>) =>
        this.endEvent(event, segments),
      update: (segments: Partial<CustomSegments[T]>) =>
        this.updateEventData(event, segments),
    };
  }

  cancelEvent<T extends keyof CustomSegments>(event: T) {
    localStorage.removeItem(this.keyOfKey(event));
    localStorage.removeItem(this.keyOfKey(event + this.data_postfix));
  }

  updateEventData<T extends keyof CustomSegments>(
    event: T,
    segments: Partial<CustomSegments[T]>
  ): void {
    const prevData = JSON.parse(
      localStorage.getItem(this.keyOfKey(event + this.data_postfix)) ?? "{}"
    );
    localStorage.setItem(
      this.keyOfKey(event + this.data_postfix),
      JSON.stringify({ ...prevData, ...segments })
    );
  }

  endEvent<T extends keyof CustomSegments>(
    event: T,
    segments: Partial<CustomSegments[T]> = {}
  ) {
    const ts = new Date(
      parseInt(localStorage.getItem(this.keyOfKey(event)) ?? "0")
    );
    const data = JSON.parse(
      localStorage.getItem(this.keyOfKey(event + this.data_postfix)) ?? "{}"
    );
    localStorage.removeItem(this.keyOfKey(event + this.data_postfix));
    localStorage.removeItem(this.keyOfKey(event));
    segments.channel = "web";
    this.add_event({
      key: event,
      dur: +new Date() - +ts,
      segmentation: { ...data, ...segments },
    });
  }

  private keyOfKey = (k: string): string => `${this.countly_prefix_key} - ${k}`;
}
