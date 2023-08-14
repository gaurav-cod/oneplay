type DeviceInfo = {
    app: string;
    device: string;
};

type Location = {
    city: string;
    country: string;
};

type Duration = {
    hrs: number;
    mins: number;
}

export class GameplayHistoryModal {
    readonly browser: string
    readonly device: DeviceInfo;
    readonly game: string
    readonly location?: Location;
    readonly startTime: Date;
    readonly endTime: Date;
    readonly duration?: Duration;

    constructor(json:any) {
        this.browser = json.browser;
        this.device = json.device;
        this.game = json.game;
        this.startTime = new Date(json.start_time);
        this.endTime = new Date(json.end_time);

        const { hrs, mins } = json.duration;
        this.duration = {
            hrs: !hrs ? 0 : hrs,
            mins: !mins ? 0 : mins,
        };

        const { app, device } = json.device_info;
        if (app || device) {
            this.device = {
                app: !app ? "Unknown App" : app,
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