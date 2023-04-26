import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "tokens" })
export class TokensPipe implements PipeTransform {
  transform(tokens: number) {
    if (tokens < 60) {
      return `${Math.round(tokens)} minutes`;
    } else {
      return `${Math.round(tokens / 60)} hours`;
    }
  }
}
