export class MediaQueries {
  static get isMobile() {
    if (
      window.matchMedia("(max-width: 425px) and (orientation: portrait)")
        .matches
    ) {
      // return true if the screen width is less than or equal to 768 pixels in portrait orientation
      return true;
    } else if (
      window.matchMedia("(max-height: 425px) and (orientation: landscape)")
        .matches
    ) {
      // return true if the screen height is less than or equal to 768 pixels in landscape orientation
      return true;
    } else {
      // return false if the screen size and orientation don't match either condition
      return false;
    }
  }

  static get isInBrowser() {
    return window.matchMedia("(display-mode: browser)").matches;
  }

  static get isAddedToHomeScreen() {
    return window.matchMedia("(display-mode: standalone)").matches;
  }
}
