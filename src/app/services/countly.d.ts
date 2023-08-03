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

export interface CustomTimedCountlyEvents {
  websiteAboutUsView: {
    getStartedClicked: "yes" | "no",
    browseArticlesClicked: "yes" | "no",
    joinDiscordClicked: "yes" | "no",
    browsePlansClicked: "yes" | "no",
  },
  websiteHomeView: {
    joinTodayClicked: "yes" | "no",
    joinDiscordClicked: "yes" | "no",
    getStartedClicked: "yes" | "no",
    browseGamesClicked: "yes" | "no",
    browseArticlesClicked: "yes" | "no",
  },
  websiteSubscriptionView: {
    hourlyCardOneClicked: "yes" | "no",
    hourlyCardTwoClicked: "yes" | "no",
    hourlyCardThreeClicked: "yes" | "no",
    hourlyCardFourClicked: "yes" | "no",
    monthlyCardOneClIcked: "yes" | "no",
    monthlyCardTwoClicked: "yes" | "no",
  },
  websiteDownloadView: {
    downloadWindowsClicked: "yes" | "no",
    downloadMacClicked: "yes" | "no",
    downloadAndroidClicked: "yes" | "no",
    downloadAndroidTVClicked: "yes" | "no",
    windowDemoClicked: "yes" | "no",
    macDemoClicked: "yes" | "no",
    androidDemoClicked: "yes" | "no",
    androidTvDemoClicked: "yes" | "no",
  },
  websiteDecentralizationView: {
    connectWithUsClicked: "yes" | "no",
  },

  signUpFormSubmitted: {
    name: "yes" | "no",
    email: "yes" | "no",
    phoneNumber: "yes" | "no",
    gender: "yes" | "no",
    password: "yes" | "no",
    referralId: "yes" | "no",
    signUpFromPage: "websiteHeader" | "tv" | "signIn" | "home" | "aboutus",
    channel: "yes" | "no",
    tncViewed: "yes" | "no",
    privacyPolicyViewed: "yes" | "no",
  },
  signUpAccountVerification: {
    result: "success" | "failure",
    failureReason: "emailExpired" | "otpExpired" | "otpTimeOut" | "otpNotReceived",
  },
  signIn: {
    result: "success" | "failure",
    signInFromPage: "websiteHeader" | "tv" | "signUp" | "home" | "aboutUs",
  },
  gameLandingView: {
    gameId: string,
    gameTitle: string,
    gameGenre: string,
    source: "homePage" | "searchPage" | "gamesPage" | "detailsPage",
    trigger: "banner" | "card" | "gameStatus",
  },
  settingsView: {
    turnOffPrivacyEnabled: "yes" | "no",
    turnOffPrivacyDisabled: "yes" | "no",
    deleteSessionDataClicked: "yes" | "no",
    deleteSessionDataConfirmClicked: "yes" | "no",
    tvSignInClicked: "yes" | "no",
    logOutClicked: "yes" | "no",
    logOutConfirmClicked: "yes" | "no",
    subscriptionViewed: "yes" | "no",
    deviceHistoryViewed: "yes" | "no",
    logoutFromAllClicked: "yes" | "no",
  },
  profileView: {
    profileViewed: "yes" | "no",
    loginsecurityViewed: "yes" | "no",
    profilePictureChanged: "yes" | "no",
    userNameChanged: "yes" | "no",
    FullNameChanged: "yes" | "no",
    bioChanged: "yes" | "no",
    updateProfileClicked: "yes" | "no",
    passwordChanged: "yes" | "no",
  },
  subscriptionConfirmPlan: {
    selection: "yes" | "no",
  },
  subscriptionPaymentView: {
    country: string,
    state: string,
    mode: "credit" | "debit" | "upi" | "netBanking",
  },
  subscriptionPaymentDone: {
    result: "success" | "failure",
    type: "newPurchase" | "renewal",
    failReason: "rejected" | "otpExpired" | "wrongOtp",
    XCountlySUM: number;
  },
  searchResultsViewMoreGames: {
    keywords: string,
    gameCardClicked: "yes" | "no",
    gameId: string,
    gameTitle: string,
  },
  searchResultsViewMoreUsers: {
    keywords: string,
    friendRequestClicked: "yes" | "no",
    userID: string,
  },
  gamePlayStart: {
    gameSessionId: string,
    gameId: string,
    gameTitle: string,
    gameGenre: string,
    store: string,
    showSettingsEnabled: "yes" | "no",
    result: "success" | "failure" | "wait",
  },
  gamePlaySettingsPageView: {
    gameSessionId: string,
    gameId: string,
    gameTitle: string,
    gameGenre: string,
    store: string,
    advanceSettingsViewed: "yes" | "no",
    settingsChanged: "yes" | "no",
    resolution: "3840x2160" | "2560x1440" | "1920x1080",
    vsyncEnabled: "yes" | "no",
    fps: "120fps" | "90fps" | "60fps" | "30fps",
    bitRate: string,
  },
  gamePlayAdvanceSettingView: {
    gameSessionId: string,
    gameId: string,
    gameTitle: string,
    gameGenre: string,
    store: string,
    settingsChanged: "yes" | "no",
    showStatsEnabled: "yes" | "no",
    fullscreenEnabled: "yes" | "no",
    onscreenControlsEnabled: "yes" | "no",
    audioType: "stereo" | "5.1",
    streamCodec: "auto" | "hevc" | "h.264",
    videoDecoderSelection: "auto" | "hardware" | "software",
  },
}

export interface CustomCountlyEvents {
  websiteFooterView: {
    homeClicked: "yes" | "no",
    aboutUsClicked: "yes" | "no",
    careerClicked: "yes" | "no",
    plansPricingClicked: "yes" | "no",
    blogClicked: "yes" | "no",
    contactUsClicked: "yes" | "no",
    faqClicked: "yes" | "no",
    privacyPolicyClicked: "yes" | "no",
    termsClicked: "yes" | "no",
    cancellationClicked: "yes" | "no",
    opensourceClicked: "yes" | "no",
    joinDiscordClicked: "yes" | "no",
    facebookClicked: "yes" | "no",
    instagramClicked: "yes" | "no",
    twitterClicked: "yes" | "no",
    mediumClicked: "yes" | "no",
  },

  menuClick: {
    homeClicked: "yes" | "no",
    gamesClicked: "yes" | "no",
    searchClicked: "yes" | "no",
    gameStatusClicked: "yes" | "no",
    speedTestClicked: "yes" | "no",
    profileClicked: "yes" | "no",
    settingsClicked: "yes" | "no",
    turnOffPrivacyEnabled: "yes" | "no",
    turnOffPrivacyDisabled: "yes" | "no",
    deleteSessionDataClicked: "yes" | "no",
    deleteSessionDataConfirmClicked: "yes" | "no",
    tvSignInClicked: "yes" | "no",
    logOutClicked: "yes" | "no",
    logOutConfirmClicked: "yes" | "no",
  },
  subscriptionCardClick: {
    hourlyCardOneClicked: "yes" | "no",
    hourlyCardTwoClicked: "yes" | "no",
    hourlyCardThreeClicked: "yes" | "no",
    hourlyCardFourClicked: "yes" | "no",
    monthlyCardOneClIcked: "yes" | "no",
    monthlyCardTwoClicked: "yes" | "no",
    source: "subscriptionPage" | "settingsPage",
    cta: "buyNow" | "renew" | "topUp" | "getStartedNow",
    XCountlySUM: number;
  },
  SubscriptionConfirmPayment: {
    paymentConfirmed: "yes" | "no",
    type: "newPurchase" | "renewal",
    XCountlySUM: number;
  },
  search: {
    keywords: string,
    actionDone: "yes" | "no",
    actionType: "seeMoreGames" | "seeMoreUsers" | "gameClicked",
  },
  gameFeedback: {
    gameSessionId: string,
    gameId: string,
    gameTitle: string,
    gameGenre: string,
    store: string,
    action: "skip" | "submit",
  },
  // gameLaunch: { channel: "Backend" },
  // gameTerminate: { channel: "Backend" },
}

export interface StartEvent<T extends keyof CustomTimedCountlyEvents> {
  data: Partial<CustomTimedCountlyEvents[T]>;
  cancel: () => void;
  end: (segments: Partial<CustomTimedCountlyEvents[T]>) => void;
  update: (segments: Partial<CustomTimedCountlyEvents[T]>) => void;
}

// export interface __CustomSegments {
//   signUPButtonClick: {
//     page: string;
//     trigger: string;
//     channel: "web";
//   },
//   signINButtonClick: {
//     page: string;
//     trigger: string;
//     channel: "web";
//   },
//   "signup - Form Submitted": {
//     name: string;
//     email: string;
//     phoneNumber: string;
//     gender: "male" | "female" | "other";
//     referralID: string;
//     signupFromPage: string;
//     privacyPolicyPageViewed: "yes" | "no";
//     TnCPageViewed: "yes" | "no";
//     channel: "web";
//   };
//   "signup - Account Verification": {
//     result: "success" | "failure";
//     failReason: string;
//     channel: "web";
//   };
//   signin: {
//     result: "success" | "failure";
//     signinFromPage: string;
//     signinFromTrigger: string;
//     rememberMeActivated: "yes" | "no";
//     channel: "web";
//   };
//   gameLandingView: {
//     gameID: string;
//     gameTitle: string;
//     gameGenre: string;
//     source: string;
//     trigger: string;
//     channel: "web";
//   };
//   "gamePlay - Start": {
//     gameID: string;
//     gameTitle: string;
//     gameGenre: string;
//     store: string;
//     showSettingEnabled: "yes" | "no";
//     channel: "web";
//   };
//   "gamePlay - Settings Page View": {
//     advancedSettingsPageViewed: "yes" | "no";
//     resolution: string;
//     bitRate: string;
//     FPS: string;
//     channel: "web";
//   };
//   "gamePlay - AdvanceSettings": {
//     settingsChanged: "yes" | "no";
//     [key: string]: any;
//     channel: "web";
//   },
//   "gamePlay - Initilization": {
//     result: "success" | "failure" | "wait";
//     channel: "web";
//   };
//   gameLaunch: {
//     gameID: string;
//     gameTitle: string;
//     gameGenre: string;
//     from: "Play now" | "Resume";
//     gamesessionid: string;
//     channel: "web";
//   };
//   gameFeedback: {
//     gameID: string;
//     gameTitle: string;
//     gameGenre: string;
//     action: "Skip" | "Submit";
//     channel: "web";
//   };
//
//   menuClick: {
//     "Type": "My Library"
//     | "Subscription"
//     | "Speed Test"
//     | "Downloads"
//     | "Settings"
//     | "Turn off privacy"
//     | "Delete session Data"
//     | "Tv Sign in"
//     | "Log out";
//   };
//
//   settingsView: {
//     ProfileViewed: "yes" | "no";
//     loginsecurity: "yes" | "no";
//     subscriptionViewed: "yes" | "no";
//     deviceHistoryViewed: "yes" | "no";
//     profilepicturechanged: "yes" | "no";
//     usernamechanged: "yes" | "no";
//     fullnamechanged: "yes" | "no";
//     biochanged: "yes" | "no";
//     updateprofileclic: "yes" | "no";
//     updatepasswordchanged: "yes" | "no";
//     logoutfromallclick: "yes" | "no";
//   };
//
//   subscriptionCardClick: {// only on home web site
//     cardType: "hourly" | "monthly";
//     Source: "Website_subscription" | "Settings Page" | string;
//     channel: "web";
//     XCountlySUM: number;
//   };
//
//   "subscription - Confirm Plan": {
//     selection: "yes" | "no";
//   };
//
//   subscriptionViewPayment: {// todo!!
//     Country: string;
//     State: string;
//     mode: "credit" | "debit" | "UPI";
//   };
//
//   subscriptionConfirmPayment: {// todo
//     paymentConfirmed: "yes" | "no";
//     type: "new purchase" | "renewal";
//     XCountlySUM: number;
//   };
//
//   subscriptionPaymentDone: {// todo
//     result: "success" | "fail";
//     type: "new purchase" | "renewal";
//     failReason: "rejected" | "OTP expired" | "wrong OTP" | string;
//     XCountlySUM: number;
//   };
//
//   search: {
//     term: string;
//     actionDone: "yes" | "no";
//     actionType: "NA" | "See more Games" | "See more Users";
//     page: string;
//     channel: "web";
//   },
//
//   searchResultsViewMoreGames: {
//     term: string;
//     gameCardClicked: "yes" | "no";
//     gameID: string;
//     gameTitle: string;
//     // gameType: string;
//     channel: "web";
//   };
//
//   searchResultsViewMoreUsers: {
//     term: string;
//     userID: string;
//     "friend request clicked": "yes" | "no";
//   };
// }
