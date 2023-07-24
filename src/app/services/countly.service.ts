import { Injectable } from "@angular/core";
import {
  CountlyEventData,
  CountlyUserData,
  CustomSegments,
  StartEvent,
} from "./countly";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { Gender } from "../models/user.model";

declare const Countly: any;

@Injectable({
  providedIn: "root",
})
export class CountlyService {
  private countly_prefix_key = "x_countly_event_key";
  private data_postfix = " - data";

  constructor(private readonly authService: AuthService) {
    this.initCountly();
  }

  track_pageview = (url: string): void => Countly.track_pageview(url);

  addEvent<T extends keyof CustomSegments>(
    event: T,
    segments: CustomSegments[T]
  ) {
    let sum = undefined;
    if ('XCountlySUM' in segments) {
      sum = segments.XCountlySUM;
      delete segments.XCountlySUM;
    }
    this._addEvent({ key: event, sum, segmentation: segments });
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
    const ts = new Date(parseInt(
      localStorage.getItem(this.keyOfKey(event)) ?? `${+new Date()}`
    ));
    const data = JSON.parse(
      localStorage.getItem(this.keyOfKey(event + this.data_postfix)) ?? "{}"
    );
    localStorage.removeItem(this.keyOfKey(event + this.data_postfix));
    localStorage.removeItem(this.keyOfKey(event));
    let sum = undefined;
    if ('XCountlySUM' in segments) {
      sum = segments.XCountlySUM;
      delete segments.XCountlySUM;
    }
    this._addEvent({
      sum,
      key: event,
      dur: (+new Date() - +ts) / 1000,
      segmentation: { ...data, ...segments },
    });
  }

  updateUser<T extends keyof CountlyUserData>(
    key: T,
    value: CountlyUserData[T],
    save = false
  ) {
    Countly.userData.set(key, value);
    if (save) {
      this.saveUser();
    }
  }

  saveUser() {
    Countly.userData.save();
  }

  private keyOfKey = (k: string): string => `${this.countly_prefix_key} - ${k}`;

  private _addEvent = (data: CountlyEventData): void => Countly.add_event(data);

  private async initCountly() {
    Countly.init({
      // debug: false,
      debug: !environment.production,
      app_key: environment.countly.key,
      url: environment.countly.url,
      heatmap_whitelist: [environment.domain],
      app_version: environment.appVersion,
    });

    Countly.track_sessions();
    Countly.track_clicks();
    Countly.track_scrolls();
    Countly.track_errors();
    Countly.track_links();

    this.authService.user.subscribe((user) => {
      if (!user || user.id === Countly.get_device_id()) {
        return;
      }

      const idType = Countly.get_device_id_type();

      switch (idType) {
        case Countly.DeviceIdType.DEVELOPER_SUPPLIED:
          Countly.change_id(user.id);
          break;
        case Countly.DeviceIdType.SDK_GENERATED:
          Countly.change_id(user.id, true);
          break;
        case Countly.DeviceIdType.TEMPORARY_ID:
          Countly.disable_offline_mode(user.id);
          break;
      }

      const option: CountlyUserData = {
        name: user.name,
      };

      switch (user.gender) {
        case Gender.Male:
          option.gender = "M";
          break;
        case Gender.Female:
          option.gender = "F";
      }

      if (user.username) {
        option.username = user.username;
      }

      if (user.age) {
        option.byear = new Date().getFullYear() - user.age;
      }

      if (user.photo) {
        option.picture = user.photo;
      }

      Countly.user_details(option);
    });

    Countly.q.push([
      "track_performance",
      {
        //page load timing
        RT: {},
        //required for automated networking traces
        instrument_xhr: true,
        captureXhrRequestResponse: true,
        AutoXHR: {
          alwaysSendXhr: true,
          monitorFetch: true,
          captureXhrRequestResponse: true,
        },
        //required for screen freeze traces
        Continuity: {
          enabled: true,
          monitorLongTasks: true,
          monitorPageBusy: true,
          monitorFrameRate: true,
          monitorInteractions: true,
          afterOnload: true,
        },
      },
    ]);
  }
}
