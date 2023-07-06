export type CountlyEventType =
  | "add_event"
  | "start_event"
  | "cancel_event"
  | "end_event";

export type CountlyEventData = {
  key: string;
  sum?: number;
  dur?: number;
  count?: number;
  segmentation?: object;
};

export type CountlyEvent = [
  eventType: CountlyEventType,
  eventData: CountlyEventData | string
];

export interface CustomSegments {
  signUPButtonClick: {
    page: string;
    trigger: string;
    channel?: "web";
  };
  signINButtonClick: {
    page: string;
    trigger: string;
    channel?: "web";
  };
  "signup - Form Submitted": {
    result: "success" | "failure";
    name: string;
    email: string;
    phoneNumber: string;
    gender: "male" | "female" | "other";
    referralID: string;
    signupFromPage: string;
    privacyPolicyPageViewed: "yes" | "no";
    TnCPageViewed: "yes" | "no";
    channel?: "web";
  };
  "signup - Account Verification": {
    result: "success" | "failure";
    failReason: string;
    channel?: "web";
  };
  signin: {
    result: "success" | "failure";
    signinFromPage: string;
    signinFromTrigger: string;
    rememberMeActivated: "yes" | "no";
    channel?: "web";
  };
  gameLandingView: {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    page: string;
    trigger: string;
    channel?: "web";
  };
  "gamePlay - Start": {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    store: string;
    showSettingEnabled: "yes" | "no";
    channel?: "web";
  };
  "gamePlay - Settings Page View": {
    advancedSettingsPageViewed: "yes" | "no";
    resolution: string;
    bitRate: string;
    FPS: string;
    channel?: "web";
  };
  "gamePlay - Initilization": {
    result: "success" | "failure" | "wait";
    channel?: "web";
  };
  gameLaunch: {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    from: "Play now" | "Resume";
    gamesessionid: string;
    channel?: "web";
  };
  gameFeedback: {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    action: "Skip" | "Submit";
    channel?: "web";
  };
}

export interface StartEvent<T extends keyof CustomSegments> {
  data: Partial<CustomSegments[T]>;
  cancel: () => void;
  end: (segments: Partial<CustomSegments[T]>) => void;
  update: (segments: Partial<CustomSegments[T]>) => void;
}
