export type CountlyEventType =
  | "add_event"
  | "start_event"
  | "cancel_event"
  | "end_event";

export type CountlyUserData = {
  name: string;
  gender?: 'M' | 'F';
  username?: string;
  byear?: number;
  picture?: string;
}

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
    channel: "web";
  },
  signINButtonClick: {
    page: string;
    trigger: string;
    channel: "web";
  },
  "signup - Form Submitted": {
    name: string;
    email: string;
    phoneNumber: string;
    gender: "male" | "female" | "other";
    referralID: string;
    signupFromPage: string;
    privacyPolicyPageViewed: "yes" | "no";
    TnCPageViewed: "yes" | "no";
    channel: "web";
  };
  "signup - Account Verification": {
    result: "success" | "failure";
    failReason: string;
    channel: "web";
  };
  signin: {
    result: "success" | "failure";
    signinFromPage: string;
    signinFromTrigger: string;
    rememberMeActivated: "yes" | "no";
    channel: "web";
  };
  gameLandingView: {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    source: string;
    trigger: string;
    channel: "web";
  };
  "gamePlay - Start": {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    store: string;
    showSettingEnabled: "yes" | "no";
    channel: "web";
  };
  "gamePlay - Settings Page View": {
    advancedSettingsPageViewed: "yes" | "no";
    resolution: string;
    bitRate: string;
    FPS: string;
    channel: "web";
  };
  "gamePlay - AdvanceSettings": {
    settingsChanged: "yes" | "no";
    [key: string]: any;
    channel: "web";
  },
  "gamePlay - Initilization": {
    result: "success" | "failure" | "wait";
    channel: "web";
  };
  gameLaunch: {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    from: "Play now" | "Resume";
    gamesessionid: string;
    channel: "web";
  };
  gameFeedback: {
    gameID: string;
    gameTitle: string;
    gameGenre: string;
    action: "Skip" | "Submit";
    channel: "web";
  };

  menuClick: {
    "Type": "My Library"
    | "Subscription"
    | "Speed Test"
    | "Downloads"
    | "Settings"
    | "Turn off privacy"
    | "Delete session Data"
    | "Tv Sign in"
    | "Log out";
  };

  settingsView: {
    ProfileViewed: "yes" | "no";
    loginsecurity: "yes" | "no";
    subscriptionViewed: "yes" | "no";
    deviceHistoryViewed: "yes" | "no";
    profilepicturechanged: "yes" | "no";
    usernamechanged: "yes" | "no";
    fullnamechanged: "yes" | "no";
    biochanged: "yes" | "no";
    updateprofileclic: "yes" | "no";
    updatepasswordchanged: "yes" | "no";
    logoutfromallclick: "yes" | "no";
  };

  subscriptionCardClick: {// only on home web site
    cardType: "hourly" | "monthly";
    Source: "Website_subscription" | "Settings Page" | string;
    channel: "web";
    XCountlySUM: number;
  };

  "subscription - Confirm Plan": {
    selection: "yes" | "no";
  };

  subscriptionViewPayment: {// todo!!
    Country: string;
    State: string;
    mode: "credit" | "debit" | "UPI";
  };

  subscriptionConfirmPayment: {// todo
    paymentConfirmed: "yes" | "no";
    type: "new purchase" | "renewal";
    XCountlySUM: number;
  };

  subscriptionPaymentDone: {// todo
    result: "success" | "fail";
    type: "new purchase" | "renewal";
    failReason: "rejected" | "OTP expired" | "wrong OTP" | string;
    XCountlySUM: number;
  };

  search: {
    term: string;
    actionDone: "yes" | "no";
    actionType: "NA" | "See more Games" | "See more Users";
    page: string;
    channel: "web";
  },

  searchResultsViewMoreGames: {
    term: string;
    gameCardClicked: "yes" | "no";
    gameID: string;
    gameTitle: string;
    // gameType: string;
    channel: "web";
  };

  searchResultsViewMoreUsers: {
    term: string;
    userID: string;
    "friend request clicked": "yes" | "no";
  };
}

export interface StartEvent<T extends keyof CustomSegments> {
  data: Partial<CustomSegments[T]>;
  cancel: () => void;
  end: (segments: Partial<CustomSegments[T]>) => void;
  update: (segments: Partial<CustomSegments[T]>) => void;
}
