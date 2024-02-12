
const STREAM_PLATFORM_SORT = {"Youtube": 0, "Twitch": 1, "Custom": 2};

export class streamConfig {

    readonly id: string;
    readonly key: string;
    readonly serviceName: string;
    readonly url: string;
    readonly icon: string;
    readonly isCustom: boolean;

    isClicked: boolean;
    isKeyAvailable: boolean;
    showPassword: boolean;
    sortIndex: number = 0;

    constructor(json) {
        this.isCustom = json["is_custom"] == "true";
        this.id = json["id"];
        this.serviceName = json["service_name"];
        this.key = json["key"];
        this.url = json["url"];

        this.showPassword = false;
        this.isClicked = false;
        this.isKeyAvailable = !!json["key"];
        this.icon = this.isCustom ? "custom" : json["service_name"]?.toLowerCase();
        this.sortIndex = STREAM_PLATFORM_SORT[this.isCustom ? "Custom" : this.serviceName];
    }

    getAdditionalConfig() {
        return {
            isClicked: this.isClicked,
            isKeyAvailable: this.isKeyAvailable,
            showPassword: this.showPassword
        }
    }
    setAdditionConfig(json) {
        this.isClicked = json["isClicked"] ?? this.isClicked;
        this.isKeyAvailable = json["isKeyAvailable"] ?? this.isKeyAvailable;
        this.showPassword = json["showPassword"] ?? this.showPassword;
    }

    setIsClicked(val: boolean) {
        this.isClicked = val;
    }
    getIsClicked() {
        return this.isClicked;
    }
    isAllDetailsFilled() {
        return this.isCustom ? !!this.url && !!this.serviceName && !!this.key : !!this.key;
    }
    isSame(stream) {
        return this.isCustom ? this.url === stream.url && this.serviceName === stream.serviceName && this.key === stream.key : this.key === stream.key;
    }

}