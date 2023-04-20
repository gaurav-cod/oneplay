type DeviceInfo = {
  app: string;
  device: string;
};

type Location = {
  city: string;
  country: string;
};

export class Session {
  readonly userId: string;
  readonly key: string;
  readonly timestamp: Date;
  readonly device?: DeviceInfo;
  readonly location?: Location;

  constructor(json: { [key: string]: any }) {
    this.userId = json.userId;
    this.key = json.key;
    this.timestamp = new Date(json.timestamp);

    const { app, device } = json.device_info;
    if (app || device) {
      this.device = {
        app: !app ? "Unkwon App" : app,
        device: !device ? "Unknown Device" : device,
      };
    }

    const { city, country } = json.location_info;
    if (city || country) {
      this.location = {
        city: !city ? "Unknown City" : city,
        country: !country ? "Unknown Country" : country,
      };
    }
  }
}
