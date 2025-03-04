export type CountlyEventType =
  | "add_event"
  | "start_event"
  | "cancel_event"
  | "end_event";

export type CountlyUserData = {
  name: string;
  gender?: "M" | "F";
  username?: string;
  byear?: number;
  picture?: string;
};

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

export enum ErrorStack {
  Timeout = "Timeout",
  ServerError = "Server is not responding",
}

export type CountlyHttpError = {
  stack: ErrorStack;
  fatal: boolean;
  data: {
    apiEndpoint: string;
    userId: string | null;
    method: string;
    headers: any;
    body: any;
    errorResponse: any;
  };
};

export interface StartEvent<T extends keyof CustomTimedCountlyEvents> {
  key: () => string;
  cancel: () => void;
  data: () => Partial<CustomTimedCountlyEvents[T]>;
  end: (segments: Partial<CustomTimedCountlyEvents[T]>) => void;
  update: (segments: Partial<CustomTimedCountlyEvents[T]>) => void;
}

export const XCountlySUM = "XCountlySUM";

export interface CustomCountlyEvents {
  websiteFooterView: {
    homeClicked: "yes" | "no";
    aboutUsClicked: "yes" | "no";
    careerClicked: "yes" | "no";
    plansPricingClicked: "yes" | "no";
    blogClicked: "yes" | "no";
    contactUsClicked: "yes" | "no";
    faqClicked: "yes" | "no";
    privacyPolicyClicked: "yes" | "no";
    termsClicked: "yes" | "no";
    cancellationClicked: "yes" | "no";
    opensourceClicked: "yes" | "no";
    joinDiscordClicked: "yes" | "no";
    facebookClicked: "yes" | "no";
    instagramClicked: "yes" | "no";
    twitterClicked: "yes" | "no";
    mediumClicked: "yes" | "no";
    contentCreatorsClicked: "yes" | "no";
    businessesClicked: "yes" | "no";
  };
  menuClick: {
    homeClicked: "yes" | "no";
    gamesClicked: "yes" | "no";
    streamsClicked: "yes" | "no";
    searchClicked: "yes" | "no";
    gameStatusClicked: "yes" | "no";
    profileClicked: "yes" | "no";
    userType: "guest" | "registered";
    level1Clicked: "yes" | "no";
  };
  menuDropdownClick: {
    myLibraryClicked: "yes" | "no";
    subscriptionClicked: "yes" | "no";
    speedTestClicked: "yes" | "no";
    downloadsClicked: "yes" | "no";
    settingsClicked: "yes" | "no";
    turnOffPrivacyEnabled: "yes" | "no";
    turnOffPrivacyDisabled: "yes" | "no";
    deleteSessionDataClicked: "yes" | "no";
    deleteSessionDataConfirmClicked: "yes" | "no";
    tvSignInClicked: "yes" | "no";
    logOutClicked: "yes" | "no";
    logOutConfirmClicked: "yes" | "no";
    dateOfBirthChanged: "yes" | "no"
  };
  couponClicked: {
    gameId: string;
    userId: string;
    price: number;
    storeId: string;
  },
  search: {
    keywords: string;
    actionDone: "yes" | "no";
    actionType:
      | "seeMoreGames"
      | "seeMoreUsers"
      | "gameClicked"
      | "addFriend"
      | "cancelled";
    userType: "guest" | "registered";
  };
  gameTerminate: {
    gameSessionId: string;
    gameId: string;
    gameTitle: string;
    gameGenre: string;
    store: string;
    terminationType: "userInitiated";
    sessionDuration: number;
    playDuration: number;
    idleDuration: number;
  };
  homeView: {
    bannerClicked: string | "no";
    railClicked: string | "no";
    myLibraryClicked: string | "no";
    filterClicked: string | "no";
    filterGameClicked: string | "no";
    channel: "web" | "mobile" | "androidTv";
    partner: string;
    userType: "guest" | "registered";
  }
}

export interface CustomTimedCountlyEvents {
  websiteAboutUsView: {
    getStartedClicked: "yes" | "no";
    browseArticlesClicked: "yes" | "no";
    joinDiscordClicked: "yes" | "no";
    browsePlansClicked: "yes" | "no";
    accessHomeClicked: "yes" | "no"
  };
  websiteHomeView: {
    joinTodayClicked: "yes" | "no";
    joinDiscordClicked: "yes" | "no";
    getStartedClicked: "yes" | "no";
    browseGamesClicked: "yes" | "no";
    browseArticlesClicked: "yes" | "no";
  };
  websiteSubscriptionView: {
    hourlyCardOneClicked: "yes" | "no";
    hourlyCardTwoClicked: "yes" | "no";
    hourlyCardThreeClicked: "yes" | "no";
    hourlyCardFourClicked: "yes" | "no";
    monthlyCardOneClIcked: "yes" | "no";
    monthlyCardTwoClicked: "yes" | "no";
  };
  websiteDownloadView: {
    downloadWindowsClicked: "yes" | "no";
    downloadMacClicked: "yes" | "no";
    downloadAndroidClicked: "yes" | "no";
    downloadAndroidTVClicked: "yes" | "no";
    windowDemoClicked: "yes" | "no";
    macDemoClicked: "yes" | "no";
    androidDemoClicked: "yes" | "no";
    androidTvDemoClicked: "yes" | "no";
  };
  websiteDecentralizationView: {
    connectWithUsClicked: "yes" | "no";
  };
  Level1View: {
    bannerClicked: string;
    railClicked: string;
    filterClicked: string;
    filterGameClicked: string;
    userType: "guest" | "registered"
  };
  signUpFormSubmitted: {
    name: "yes" | "no";
    email: "yes" | "no";
    phoneNumber: "yes" | "no";
    gender: "yes" | "no";
    password: "yes" | "no";
    referralId: "yes" | "no";
    signUpFromPage:
      | "websiteHeader"
      | "directLink"
      | "signIn"
      | "home"
      | "aboutus";
    tncViewed: "yes" | "no";
    privacyPolicyViewed: "yes" | "no";
  };
  signUpAccountVerification: {
    result: "success" | "failure";
    failureReason: "invalidOtp" | "invalidToken" | "tokenExpired";
  };
  signIn: {
    result?: "success" | "failure";
    signInFromPage?:
      | "websiteHeader"
      | "directLink"
      | "signUp"
      | "home"
      | "aboutUs"
      | "appHeader"
      | "megaMenu"
      | "subscriptionPage"
      | "gameDetailspage"
      | "chat"
      | "accessHome";
    phoneNumberEntered: "yes" | "no";
    getOtpClicked: "yes" | "no";
    guestLoginClicked: "yes" | "no";
    ReferralIdEntered: "yes" | "no";
    ReferralIdClicked: "yes" | "no";
    otpEntered: "yes" | "no";
    otpFailure: "yes" | "no";
    otpFailureReson?: "expired" | "invalid";
    resendOtpClicked: "yes" | "no";
    changePhoneNumber: "yes" | "no";
    passwordRequired: "yes" | "no";
    passwordEnterd: "yes" | "no";
    passwordfailed: "yes" | "no";
    passwordGetOtpClicked: "yes" | "no";
  };
  guestProfile: {
    SignInClicked: "yes" | "no";
    subscribeClicked: "yes" | "no";
    speedTestClicked: "yes" | "no";
  };
  detailsPopUp: {
    dateOfBirth?: "success" | "skip" | "later" | "close";
    password?: "success" | "skip" | "later" | "close";
    userName?: "success" | "skip" | "later" | "close";
    fullName?: "success" | "skip" | "later" | "close";
  };
  gameLandingView: {
    gameId: string;
    gameTitle: string;
    gameGenre: string;
    source:
      | "myLibrary"
      | "homePage"
      | "gamezop"
      | "searchPage"
      | "gamesPage"
      | "detailsPage"
      | "directLink"
      | "homePageBanner"
      | "homePageRail"
      | "homePageFilter";
    trigger: "banner" | "card" | "gameStatus";
    userType: "guest" | "registered"
  };
  settingsView: {
    profileViewed: "yes" | "no";
    logInSecurityViewed: "yes" | "no";
    subscriptionViewed: "yes" | "no";
    deviceHistoryViewed: "yes" | "no";
    profilePictureChanged: "yes" | "no";
    userNameChanged: "yes" | "no";
    fullNameChanged: "yes" | "no";
    bioChanged: "yes" | "no";
    updateProfileClicked: "yes" | "no";
    passwordChanged: "yes" | "no";
    logoutFromAllClicked: "yes" | "no";
    dateOfBirthChanged: "yes" | "no"
  };
  chat: {
    friendClicked: "yes" | "no";
    unfriendClicked: "yes" | "no";
    messageSent: "yes" | "no";
  };
  subscriptionCardClick: {
    source: "settingsPage" | "subscriptionPage" | "guestProfile";
    cta: "renew" | "topUp" | "buyNow" | "select";
    [XCountlySUM]: number;
  };
  subscriptionCheckOut: {
    couponApplied: "yes" | "no";
    paymentOption: "stripe" | "billdesk";
  };
  searchResultsViewMoreGames: {
    keywords: string;
    gameCardClicked: "yes" | "no";
    gameId: string;
    gameTitle: string;
    userType: "guest" | "registered"
  };
  searchResultsViewMoreUsers: {
    keywords: string;
    friendRequestClicked: "yes" | "no";
    userID: string;
  };
  gamePlayStart: {
    gameSessionId: string;
    gameId: string;
    gameTitle: string;
    gameGenre: string;
    store: string;
    showSettingsEnabled: "yes" | "no";
    result: "success" | "failure" | "wait";
  };
  gamePlaySettingsPageView: {
    gameId: string;
    gameTitle: string;
    gameGenre: string;
    store: string;
    advanceSettingsViewed: "yes" | "no";
    settingsChanged: "yes" | "no";
    resolution: "1280x720" | "1920x1080" | "2560x1440" | "3840x2160";
    vsyncEnabled: "yes" | "no";
    fps: "120fps" | "90fps" | "60fps" | "30fps";
    bitRate: string;
  };
  gamePlayAdvanceSettingView: {
    gameId: string;
    gameTitle: string;
    gameGenre: string;
    store: string;
    settingsChanged: "yes" | "no";
    showStatsEnabled: "yes" | "no";
    fullscreenEnabled: "yes" | "no";
    onscreenControlsEnabled: "yes" | "no";
    audioType: "stereo" | "5.1";
    streamCodec: "auto" | "hevc" | "h.264";
    videoDecoderSelection: "auto" | "hardware" | "software";
  };
  gameFeedback: {
    gameSessionId: string;
    gameId: string;
    gameTitle: string;
    gameGenre: string;
    store: string;
    action: "skip" | "submit";
  };
  homeView: {
    bannerClicked: string;
    railClicked: string;
    myLibraryClicked: string;
    filterClicked: string;
    filterGameClicked: string;
    userType: "guest" | "registered"
  };
}
