import { StripeErrorType } from "@stripe/stripe-js";
import {
  CustomCountlyEvents,
  CustomTimedCountlyEvents,
} from "../services/countly";
import { environment } from "src/environments/environment";
import Cookies from "js-cookie";

export const getGameLandingViewSource =
  (): CustomTimedCountlyEvents["gameLandingView"]["source"] => {
    const path = window.location.pathname;
    if (path.startsWith("/dashboard/store")) {
      return "gamesPage";
    } else if (path.startsWith("/dashboard/view")) {
      return "detailsPage";
    } else if (path.startsWith("/dashboard/home")) {
      return "homePage";
    } else if (path.startsWith("/dashboard/search")) {
      return "searchPage";
    } else if (path.startsWith("/dashboard/wishlist")) {
      return "myLibrary";
    } else {
      return "directLink";
    }
  };

export const mapResolutionstoGamePlaySettingsPageView = (
  resolution: string
): CustomTimedCountlyEvents["gamePlaySettingsPageView"]["resolution"] => {
  switch (resolution) {
    case "1280x720":
      return "1280x720";
    case "1920x1080":
      return "1920x1080";
    case "2560x1440":
      return "2560x1440";
    case "3840x2160":
      return "3840x2160";
    default:
  }
};

export const mapFPStoGamePlaySettingsPageView = (
  fps: string
): CustomTimedCountlyEvents["gamePlaySettingsPageView"]["fps"] => {
  switch (fps.toString()) {
    case "30":
      return "30fps";
    case "60":
      return "60fps";
    case "90":
      return "90fps";
    case "120":
      return "120fps";
    default:
  }
};

export const mapStreamCodecForGamePlayAdvanceSettingView = (
  codec: string
): CustomTimedCountlyEvents["gamePlayAdvanceSettingView"]["streamCodec"] => {
  switch (codec) {
    case "neverh265":
      return "h.264";
    case "forceh265":
      return "hevc";
    case "auto":
      return "auto";
    default:
  }
};

export const mapSignUpAccountVerificationFailureReasons = (
  reason: string
): CustomTimedCountlyEvents["signUpAccountVerification"]["failureReason"] => {
  switch (reason) {
    case "Invalid OTP":
      return "invalidOtp";
    case "Invalid Token":
      return "invalidToken";
    case "Token Expired":
      return "tokenExpired";
    default:
  }
};

export const genDefaultWebsiteFooterViewSegments =
  (): CustomCountlyEvents["websiteFooterView"] => {
    return {
      homeClicked: "no",
      gamezopClicked: "no",
      aboutUsClicked: "no",
      careerClicked: "no",
      plansPricingClicked: "no",
      blogClicked: "no",
      contactUsClicked: "no",
      faqClicked: "no",
      privacyPolicyClicked: "no",
      termsClicked: "no",
      cancellationClicked: "no",
      opensourceClicked: "no",
      joinDiscordClicked: "no",
      facebookClicked: "no",
      instagramClicked: "no",
      twitterClicked: "no",
      mediumClicked: "no",
      contentCreatorsClicked: "no",
      businessesClicked: "no",
    };
  };

export const genDefaultSettingsViewSegments =
  (): CustomTimedCountlyEvents["settingsView"] => {
    return {
      profileViewed: "no",
      logInSecurityViewed: "no",
      subscriptionViewed: "no",
      profilePictureChanged: "no",
      userNameChanged: "no",
      fullNameChanged: "no",
      bioChanged: "no",
      updateProfileClicked: "no",
      passwordChanged: "no",
      deviceHistoryViewed: "no",
      logoutFromAllClicked: "no",
      dateOfBirthChanged: "no"
    };
  };

export const genDefaultMenuClickSegments =
  (): CustomCountlyEvents["menuClick"] => {
    return {
      homeClicked: "no",
      gamezopClicked: "no",
      gamesClicked: "no",
      streamsClicked: "no",
      searchClicked: "no",
      gameStatusClicked: "no",
      profileClicked: "no",
      userType: Cookies.get("op_session_token") ? "registered" : "guest",
      level1Clicked: "no"
    };
  };

export const getDefaultHomeClickSegments = (): CustomTimedCountlyEvents["homeView"] => {
  return {
    bannerClicked: "no",
    railClicked: "no",
    myLibraryClicked: "no",
    filterClicked: "no",
    filterGameClicked: "no",
    userType: Cookies.get("op_session_token") ? "registered" : "guest"
  }
}

export const getDefaultSignInSegments = (): CustomTimedCountlyEvents["signIn"] => {
  return {
    channel: "web",
    partner: environment.partner_name,
    signInFromPage: "home",
    phoneNumberEntered: "no",
    getOtpClicked: "no",
    guestLoginClicked: "no",
    ReferralIdClicked: "no",
    ReferralIdEntered: "no",
    otpEntered: "no",
    otpFailure: "no",
    resendOtpClicked: "no",
    changePhoneNumber: "no",
    passwordRequired: "no",
    passwordEntered: "no",
    passwordfailed: "no",
    passwordGetOtpClicked: "no"
  }
}

export const genDefaultMenuDropdownClickSegments =
  (): CustomCountlyEvents["menuDropdownClick"] => {
    return {
      myLibraryClicked: "no",
      subscriptionClicked: "no",
      speedTestClicked: "no",
      downloadsClicked: "no",
      settingsClicked: "no",
      turnOffPrivacyEnabled: "no",
      turnOffPrivacyDisabled: "no",
      deleteSessionDataClicked: "no",
      deleteSessionDataConfirmClicked: "no",
      tvSignInClicked: "no",
      logOutClicked: "no",
      logOutConfirmClicked: "no",
      dateOfBirthChanged: "no"
    };
  };


export const getDefaultChatEvents = (): CustomTimedCountlyEvents["chat"] => {
  return {
    friendClicked: "no",
    unfriendClicked: "no",
    messageSent: "no",
    channel: "web",
    partner: environment.partner_name
  }
}

export const getDefaultDetailPopupEvents = (): CustomTimedCountlyEvents["detailsPopUp"] => {
  return {
    channel: "web",
    partner: environment.partner_name
  }
}

  export const getDefaultGuestProfileEvents = (): CustomTimedCountlyEvents["guestProfile"] => {
    return {
      SignInClicked: "no",
      subscribeClicked: "no",
      speedTestClicked: "no",
    }
  }
  export const getDefaultLevel1ViewEvents = (): CustomTimedCountlyEvents["Level1View"] => {
    return {
      bannerClicked: "no",
      railClicked: "no",
      filterClicked: "no",
      filterGameClicked: "no",
      channel: "web",
      partner: environment.partner_name,
      userType: Cookies.get("op_session_token") ? "registered" : "guest"
    }
  }

// export const getDefaultSignInClicked = (): CustomTimedCountlyEvents["signIn"] => {
//   return {
//     phoneNumberEntered: "no",
//     getOtpClicked: "no",
//     guestLoginClicked: "no",
//     ReferralIdEntered: "no",
//     ReferralIdClicked: "no",
//     otpEntered: "no",
//     otpFailure: "no",
//     resendOtpClicked: "no",
//     changePhoneNumber: "no",
//     passwordRequired: "no",
//     passwordEntered: "no",
//     passwordfailed: "no",
//     passwordGetOtpClicked: "no"
//   }
// }