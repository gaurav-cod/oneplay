import { UAParser } from "ua-parser-js";

export class Session {
    readonly userId: string;
    readonly device: string;
    readonly ip: string;
    readonly browser: string;
    readonly os: string;
    readonly key: string;
    readonly timestamp: Date;

    constructor(json: {[key: string]: any}) {
        const ua = new UAParser(json.uagent);

        this.userId = json.userId;
        this.device = ua.getDevice().type || json.device;
        this.ip = json.ip;
        this.browser = ua.getBrowser().name;
        this.os = ua.getOS().name;
        this.key = json.key;
        this.timestamp = new Date(json.timestamp);
    }
}
