import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "store",
})
export class StorePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return `assets/img/store/${this.getImageName(value)}`;
  }

  private getImageName(store_name: string): string {
    if (/^epic/i.exec(store_name)) {
      return "epic.png";
    } else if (/^battle/i.exec(store_name)) {
      return "battle_net.png";
    } else if (/^(origin|ea)/i.exec(store_name)) {
      return "origin.png";
    } else if (/^steam/i.exec(store_name)) {
      return "steam.png";
    } else if (/^(uplay|ubisoft)/i.exec(store_name)) {
      return "uplay.png";
    } else if (/^gog/i.exec(store_name)) {
      return "gog.png";
    } else if (/^rockstar/i.exec(store_name)) {
      return "rockstar.png";
    }
  }
}
