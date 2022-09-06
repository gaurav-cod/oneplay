export class PlayConstants {
  static readonly RESOLUTIONS = [
    // "800x600",
    // "1024x768",
    // "1280x720",
    // "1366x768",
    "1920x1080",
    // "2560x1440",
    // "2560x1600",
    // "3840x2160",
  ];

  static readonly MOBILE_RESOLUTIONS = [
    "800x600",
    "1024x768",
    "1280x720",
    "1366x768",
    "1920x1080",
  ]

  static readonly DEFAULT_RESOLUTIONS = {
    Starter: "1366x768",
    Founder: "1920x1080",
    Elite: "1920x1080",
  };

  static readonly RESOLUTIONS_PACKAGES = {
    Starter: ["800x600", "1024x768", "1280x720", "1366x768"],
    Founder: ["800x600", "1024x768", "1280x720", "1366x768", "1920x1080"],
    Elite: [
      "800x600",
      "1024x768",
      "1280x720",
      "1366x768",
      "1920x1080",
      "2560x1440",
      "2560x1600",
      "3840x2160",
    ],
  };

  static readonly MAX_RESOLUTION_WIDTH = {
    Starter: 1366,
    Founder: 1920,
    Elite: 3840,
  }

  static readonly FPS = [30, 60];

  static readonly DEFAULT_FPS = 60;

  static readonly VSYNC = [
    {
      label: "Off",
      value: false,
    },
    {
      label: "On",
      value: true,
    },
  ];

  static getIdleBitrate(resolution: string, fps = 60) {
    const b = {
      "800x600": 5000,
      "1024x768": 10000,
      "1280x720": 10000,
      "1366x768": 20000,
      "1920x1080": 20000,
      "2560x1440": 40000,
      "2560x1600": 40000,
      "3840x2160": 80000,
    };

    let bitrate: number = b[resolution];

    if (bitrate === undefined) {
      if (screen.width >= 3840) {
        bitrate = 80000;
      } else if (screen.width >= 2560) {
        bitrate = 40000;
      } else if (screen.width >= 1366) {
        bitrate = 20000;
      } else if (screen.width >= 1024) {
        bitrate = 10000;
      } else if (screen.width >= 800) {
        bitrate = 5000;
      }
    }

    return bitrate * (fps / 60);
  }
}
