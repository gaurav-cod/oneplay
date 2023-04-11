import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "tokens" })
export class TokensPipe implements PipeTransform {
  transform(tokens: number) {
    if (tokens < 60) {
      return `${tokens.toFixed(1)} minutes`;
    } else {
      return `${(tokens / 60).toFixed(1)} hours`;
    }
  }
}
