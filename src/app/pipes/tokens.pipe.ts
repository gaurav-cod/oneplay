import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "tokens" })
export class TokensPipe implements PipeTransform {
  transform(tokens: number, fullForm = false) {
    let str = '';
    const hr = Math.floor(tokens / 60);
    const min = tokens % 60;
    if(hr > 0) {
      str =  str + hr + (fullForm ? ' hours ' : ' h ');
    }
    if(min > 0) {
      str = str + min + (fullForm ? ' minutes' : ' min');
    }
    return str;
  }
}
