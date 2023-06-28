import { Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class CountlyService {
  // push = (event: CountlyEvent) => countlyPushAsync([event.eventType, event.eventData])
  trackPageView = (url: string) => countlyPushAsync(["track_pageview", url])
  addEvent = (data: CountlyEventData) => countlyPushAsync(["add_event", data])
  startEvent = (key: CountlyEventData['key']) => countlyPushAsync(["start_event", key])
  cancelEvent = (key: CountlyEventData['key']) => countlyPushAsync(["cancel_event", key])
  endEvent(dataOrKey: CountlyEventData | CountlyEventData['key']) {
    countlyPushAsync(["end_event", dataOrKey])
  }
}