import { Injectable } from '@angular/core';
import { v4 } from "uuid";

export type CountlyEventType = "add_event" | "start_event" | "cancel_event" | "end_event"
export type CountlyEventData = {
  key: string,
  sum?: number,
  dur?: number,
  count?: number,
  segmentation?: object,
}
export type CountlyEvent = [
  eventType: CountlyEventType,
  eventData?: CountlyEventData | string,
]
declare var countlyPushAsync: Function;
export interface CustomSegments {
  signUPButtonClick: {
    page: string,
    trigger: string,
    channel?: 'web',
  },
  signINButtonClick: {
    page: string,
    trigger: string,
    channel?: 'web',
  },
  'signup - Form Submitted': {
    name: string,
    email: string,
    phoneNumber: string,
    gender: 'male' | 'female' | 'other',
    referralID: string,
    signupFromPage: string,
    privacyPolicyPageViewed: 'yes' | 'no',
    TnCPageViewed: 'yes' | 'no',
    channel?: 'web',
  },
  'signup - Account Verification': {
    result: 'success' | 'failure',
    failReason: string,
    channel?: 'web',
  },
  signin: {
    result: 'success' | 'failure',
    page: string,
    trigger: string,
    rememberMeActivated: 'yes' | 'no',
    channel?: 'web',
  },
  gameLandingView: {
    gameID: string,
    gameTitle: string,
    gameGenre: string,
    page: string,
    trigger: string,
    channel?: 'web',
  },
  'gamePlay - Start': {
    gameID: string,
    gameTitle: string,
    gameGenre: string,
    store: string,
    showSettingEnabled: 'yes' | 'no',
    channel?: 'web',
  },
  'gamePlay - Settings Page View': {
    advancedSettingsPageViewed: 'yes' | 'no',
    resolution: string,
    bitRate: string,
    FPS: string,
    channel?: 'web',
  },
  'gamePlay - Initilization': {
    result: 'success' | 'failure',
    channel?: 'web'
  },
  'gameLaunch': {
    gameID: string,
    gameTitle: string,
    gameGenre: string,
    feedback: 'yes' | 'no',
    clickResume: 'yes' | 'no',
    channel?: 'web',
  }
}

@Injectable({
  providedIn: 'root'
})
export class CountlyService {
  countly_prefix_key = 'x_countly_event_key'
  // push = (event: CountlyEvent) => countlyPushAsync(event.eventType, event.eventData)
  track_pageview = (url: string): void => countlyPushAsync("track_pageview", url)
  add_event = (data: CountlyEventData): void => countlyPushAsync("add_event", data)
  start_event = (key: CountlyEventData['key']): void => countlyPushAsync("start_event", key)
  cancel_event = (key: CountlyEventData['key']): void => countlyPushAsync("cancel_event", key)
  end_event = (dataOrKey: CountlyEventData | CountlyEventData['key']): void => countlyPushAsync("end_event", dataOrKey)

  addEvent<T extends keyof CustomSegments>(event: T, segments: CustomSegments[T]) {
    // if (segments.dur) throw "Cannot add a timed Event.";
    // delete segments.dur;
    segments.channel = 'web';
    this.add_event({ key: event, segmentation: segments });
  }
  startEvent<T extends keyof CustomSegments>(event: T, unique?: boolean): { key: string, cancel: () => void; end: (segments: CustomSegments[T]) => void; } {
    const uniqueKey = unique ? ` - ${v4()}` : '';
    localStorage.setItem(this.keyOfKey(event + uniqueKey), `${+new Date()}`)
    return {
      key: uniqueKey,
      cancel: () => this.cancelEvent(event, uniqueKey),
      end: (segments: CustomSegments[T]) => this.endEvent(event, segments, uniqueKey),
    }
    // this.start_event(event);
  }
  cancelEvent<T extends keyof CustomSegments>(event: T, uniqueKey?: string) {
    localStorage.removeItem(this.keyOfKey(event + uniqueKey ?? ''))
    // this.cancel_event(event);
  }
  endEvent<T extends keyof CustomSegments>(event: T, segments: CustomSegments[T], uniqueKey?: string) {
    const ts = new Date(parseInt(localStorage.getItem(this.keyOfKey(event + uniqueKey ?? '')) ?? '0'));
    localStorage.removeItem(this.keyOfKey(event + uniqueKey ?? ''));
    segments.channel = 'web';
    // delete segments.dur;
    this.add_event({
      key: event,
      dur: +new Date() - +ts,
      segmentation: segments,
    })
  }

  private keyOfKey = (k: string): string => `${this.countly_prefix_key} - ${k}`
  // initEvent(){}
  // discardEvent(){}
  // settleEvent(){}
}
