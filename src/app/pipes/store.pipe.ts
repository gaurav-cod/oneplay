import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "store",
})
export class StorePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    return `assets/img/store/${this.getImageName(value)}`;
  }

  private getImageName(store_name: string): string {
    if (/epic/i.exec(store_name)) {
      return "epic.png";
    } else if (/battle/i.exec(store_name)) {
      return "battle_net.png";
    } else if (/origin/i.exec(store_name)) {
      return "origin.png";
    } else if (/steam/i.exec(store_name)) {
      return "steam.png";
    } else if (/uplay/i.exec(store_name)) {
      return "uplay.png";
    }
  }
}
