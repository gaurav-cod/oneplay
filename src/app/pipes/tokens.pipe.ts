import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "tokens" })
export class TokensPipe implements PipeTransform {
  transform(tokens: number, format: "Hr" | "hour" | undefined = undefined) {
    let str = '';
    const hr = Math.floor(tokens / 60);
    const min = Math.round(tokens % 60);
    if (hr > 0) {
      // str =  str + hr + (format === "hour" ? ` hour${hr > 1 ? 's' : ''} ` : 'Hrs ');
      if (format == "hour")
        str = hr + `hour${hr > 1 ? 's' : ''} `
      else if (format == "Hr")
        str = hr + `Hr${hr > 1 ? 's' : ''} `
      else
        str = hr.toString();
    }
    if (min > 0 && format) {
      // str = str + min + (format === "hour" ? ` minute${min > 1 ? 's' : ''}` : 'Mins');
      if (format == "hour")
        str = str + min + `minute${min > 1 ? 's' : ''}`
      else if (format == "Hr")
        str = str + min + `Min${min > 1 ? 's' : ''}`
      else
        str = min.toString();
    }
    if (str === '') {
      return '0';
    }
    return str.trim();
  }
}
