import { UAParser } from "ua-parser-js";

type DeviceInfo = {
  device?: string;
  app?: string;
  version?: string;
};

export class UserAgentUtil {
  static parse() {
    const deviceInfo: DeviceInfo = {};
    const parser = new UAParser();
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();

    if (device && device.model) {
      deviceInfo.device = device.model;
    } else if (device && device.type) {
      deviceInfo.device = device.type;
    } else if (os && os.name) {
      deviceInfo.device = os.name;
    }

    if (browser && browser.name) {
      deviceInfo.app = browser.name;
    } else if (/oneplay/i.test(navigator.userAgent)) {
      deviceInfo.app = "Oneplay App";
    }

    if (browser && browser.version) {
      deviceInfo.version = browser.version;
    } else {
      deviceInfo.version = navigator.userAgent.match(/V\d.\d.\d/)?.[0];
    }

    return deviceInfo;
  }
}
