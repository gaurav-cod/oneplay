import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "store",
})
export class StorePipe implements PipeTransform {
  transform(store_image: string, ...args: unknown[]): unknown {
    if(store_image)
    {
      return store_image;
    }
    return `assets/img/store/store.svg`;

  }

}
