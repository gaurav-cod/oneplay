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
  eventData: CountlyEventData | string,
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
  signin: {//--
    result: 'success' | 'failure',
    signinFromPage: string,
    signinFromTrigger: string,
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
  data_postfix = ' - data'

  // native countly functions from countly web sdk.
  // private push = (event: CountlyEvent) => countlyPushAsync(event[0], event[1])
  track_pageview = (url: string): void => countlyPushAsync("track_pageview", url)
  private add_event = (data: CountlyEventData): void => countlyPushAsync("add_event", data)
  // private start_event = (key: CountlyEventData['key']): void => countlyPushAsync("start_event", key)
  // private cancel_event = (key: CountlyEventData['key']): void => countlyPushAsync("cancel_event", key)
  // private end_event = (dataOrKey: CountlyEventData | CountlyEventData['key']): void => countlyPushAsync("end_event", dataOrKey)

  addEvent<T extends keyof CustomSegments>(event: T, segments: CustomSegments[T]) {
    segments.channel = 'web';
    this.add_event({ key: event, segmentation: segments });
  }
  startEvent<T extends keyof CustomSegments>(event: T, { unique, data }: { unique?: boolean, data?: Partial<CustomSegments[T]> } = {}): { data: Partial<CustomSegments[T]>; key: string; cancel: () => void; end: (segments: Partial<CustomSegments[T]>) => void; update: (segments: Partial<CustomSegments[T]>) => void; } {
    const uniqueKey = unique ? ` - ${v4()}` : '';
    localStorage.setItem(this.keyOfKey(event + uniqueKey), `${+new Date()}`)
    if (data) localStorage.setItem(this.keyOfKey(event + this.data_postfix + uniqueKey), JSON.stringify(data));
    return {
      data,
      key: uniqueKey,
      cancel: () => this.cancelEvent(event, uniqueKey),
      end: (segments: Partial<CustomSegments[T]>) => this.endEvent(event, { segments, uniqueKey }),
      update: (segments: Partial<CustomSegments[T]>) => this.updateEventData(event, { segments, uniqueKey }),
    }
  }
  cancelEvent<T extends keyof CustomSegments>(event: T, uniqueKey?: string) {
    localStorage.removeItem(this.keyOfKey(event + uniqueKey ?? ''))
    localStorage.removeItem(this.keyOfKey(event + this.data_postfix + (uniqueKey ?? '')));
  }
  updateEventData<T extends keyof CustomSegments>(event: T, { segments, uniqueKey }: { segments?: Partial<CustomSegments[T]>, uniqueKey?: string } = {}):void {
    const prevData = JSON.parse(localStorage.getItem(this.keyOfKey(event + this.data_postfix + (uniqueKey ?? ''))) ?? '{}');
    localStorage.setItem(this.keyOfKey(event + this.data_postfix + (uniqueKey ?? '')), JSON.stringify({ ...prevData, ...segments }));
  }
  endEvent<T extends keyof CustomSegments>(event: T, { segments, uniqueKey }: { segments?: Partial<CustomSegments[T]>, uniqueKey?: string } = {}) {
    const ts = new Date(parseInt(localStorage.getItem(this.keyOfKey(event + uniqueKey ?? '')) ?? '0'));
    const data = JSON.parse(localStorage.getItem(this.keyOfKey(event + this.data_postfix + (uniqueKey ?? ''))) ?? '{}');
    localStorage.removeItem(this.keyOfKey(event + this.data_postfix + (uniqueKey ?? '')));
    localStorage.removeItem(this.keyOfKey(event + uniqueKey ?? ''));
    segments.channel = 'web';
    this.add_event({
      key: event,
      dur: +new Date() - +ts,
      segmentation: { ...data, ...segments },
    })
  }

  private keyOfKey = (k: string): string => `${this.countly_prefix_key} - ${k}`
}
