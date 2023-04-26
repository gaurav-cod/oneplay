import { Pipe, PipeTransform } from '@angular/core';
import currency from '../../assets/json/currency.json';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {

  transform(value: string): string {
    return null;
  }

}
