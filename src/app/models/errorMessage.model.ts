export class ErrorMessageModel {
    readonly title: string;
    readonly message: string;
    readonly icon: string;
    readonly primary_CTA: string;
    readonly secondary_CTA: string;
    readonly showSecondaryCTA: boolean;

    toTitleCase(str: string) {
        return str.split('_').map(word => {
            if (word.length > 0) {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            } else {
              return '';
            }
        }).join(' ');
    }

    constructor(json) {
        this.title = json["title"];
        this.message = json["message"];
        this.icon = json["icon"];
        this.primary_CTA = this.toTitleCase(json["primary_CTA"]);
        this.secondary_CTA =  this.toTitleCase(json['CTAs'].indexOf(json["primary_CTA"]) == 0 ? json['CTAs'][1] : json['CTAs'][0]);
        this.showSecondaryCTA = json["CTAs"].length == 2;
    }
}