import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimBySeperator'
})
export class TrimBySeperatorPipe implements PipeTransform {

  transform(data: any[], seperator: string = ',', characterLimitDesktop: number = 28, characterLimitTab: number = 20, characterLimitMob: number = 12): unknown {
    let combinedData = '';
    const characterLimit = (window.innerWidth > 1200 ? characterLimitDesktop : (window.innerWidth > 700 ? characterLimitTab : characterLimitMob))
    if (data.length > 1)
      data.forEach((d) => combinedData += (d + seperator + " "));
    else
      combinedData = data.toString();
    const trimedText = combinedData.substring(0, characterLimit);
    return trimedText + ((data.length - trimedText.split(seperator).length) > 0 ? "... +" + (data.length - trimedText.split(seperator).length) : (combinedData.length <= characterLimit ? "" : "..." ));
  }

}
