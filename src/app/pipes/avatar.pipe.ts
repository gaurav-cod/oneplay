import { Pipe, PipeTransform } from "@angular/core";

const avatarColors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#FF9800",
  "#FF5722",
];

@Pipe({ name: "avatar" })
export class AvatarPipe implements PipeTransform {
  transform(value: string): string {
    return `https://ui-avatars.com/api/?name=${this.getInitials(
      value
    )}&background=${encodeURIComponent(
      this.getAvatarColor(value)
    )}&color=fff&size=128`;
  }

  private getInitials(name: string): string {
    let initials = "";
    if (name) {
      const names = name.split(" ");
      names.forEach((n) => {
        initials += n.charAt(0);
      });
    }
    return initials;
  }

  private getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let index = Math.abs(hash % avatarColors.length);
    return avatarColors[index];
  }
}
