import { CustomCountlyEvents, CustomTimedCountlyEvents } from "../services/countly";

export const mapSignUpAccountVerificationFailureReasons = (reason: string): CustomTimedCountlyEvents['signUpAccountVerification']['failureReason'] => {
  switch (reason) {
    case 'Invalid Token':
      return 'otpExpired';
    case 'Token Expired':
      return 'otpExpired';
    case 'Invalid OTP':
      return 'otpExpired';
    default:
      return 'otpExpired';
  }
}

export const genDefaultWebsiteFooterViewSegments = (
): CustomCountlyEvents['websiteFooterView'] => {
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
  }
}

export const genDefaultSettingsViewSegments = (
): CustomTimedCountlyEvents['settingsView'] => {
  return {
    turnOffPrivacyEnabled: "no",
    turnOffPrivacyDisabled: "no",
    deleteSessionDataClicked: "no",
    deleteSessionDataConfirmClicked: "no",
    tvSignInClicked: "no",
    logOutClicked: "no",
    logOutConfirmClicked: "no",
    subscriptionViewed: "no",
    deviceHistoryViewed: "no",
    logoutFromAllClicked: "no",
  }
}

export const genDefaultMenuClickSegments = (
): CustomCountlyEvents['menuClick'] => {
  return {
    homeClicked: "no",
    gamesClicked: "no",
    searchClicked: "no",
    gameStatusClicked: "no",
    speedTestClicked: "no",
    profileClicked: "no",
    settingsClicked: "no",
    downloadsClicked: "no",
    subscriptionClicked: "no",
    myLibraryClicked: "no",
    turnOffPrivacyEnabled: "no",
    turnOffPrivacyDisabled: "no",
    deleteSessionDataClicked: "no",
    deleteSessionDataConfirmClicked: "no",
    tvSignInClicked: "no",
    logOutClicked: "no",
    logOutConfirmClicked: "no",
  }
}
