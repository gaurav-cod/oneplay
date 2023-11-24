import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimBySeperator'
})
export class TrimBySeperatorPipe implements PipeTransform {

  transform(data: any[], seperator: string = ',', characterLimit: number = 28): unknown {
    let combinedData = '';
    data.forEach((d) => combinedData += (d + seperator + " "));
    const trimedText = combinedData.substring(0, characterLimit);
    return trimedText + ((data.length - trimedText.split(seperator).length) > 0 ? "... +" + (data.length - trimedText.split(seperator).length) : (combinedData.length <= characterLimit ? "" : "..." ));
  }

}
