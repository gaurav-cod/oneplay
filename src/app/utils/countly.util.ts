import { StripeErrorType } from "@stripe/stripe-js";
import {
  CustomCountlyEvents,
  CustomTimedCountlyEvents,
} from "../services/countly";

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

export const mapStripeErrorsToSubscriptionPaymentDone = (
  error: StripeErrorType
): CustomTimedCountlyEvents["subscriptionPaymentDone"]["failReason"] => {
  switch (error) {
    case "api_error":
      return "connection";
    case "api_connection_error":
      return "connection";
    case "authentication_error":
      return "authentication";
    case "card_error":
      return "card";
    case "idempotency_error":
      return "authentication";
    case "invalid_request_error":
      return "validation";
    case "rate_limit_error":
      return "quota";
    case "validation_error":
      return "validation";
    default:
      return "other";
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
    };
  };

export const genDefaultMenuClickSegments =
  (): CustomCountlyEvents["menuClick"] => {
    return {
      homeClicked: "no",
      gamesClicked: "no",
      streamsClicked: "no",
      searchClicked: "no",
      gameStatusClicked: "no",
      profileClicked: "no",
    };
  };

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
    };
  };
