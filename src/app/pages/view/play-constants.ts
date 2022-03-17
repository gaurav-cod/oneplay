export class PlayConstants {
  static readonly RESOLUTIONS = [
    "800x600",
    "1024x768",
    "1280x720",
    "1366x768",
    "1920x1080",
    "2560x1440",
    "2560x1600",
    "3840x2160",
  ];

  static readonly DEFAULT_RESOLUTIONS = {
    Starter: "1366x768",
    Founder: "1920x1080",
    Elite: "3840x2160",
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
    return b[resolution] * (fps / 60);
  }
}
