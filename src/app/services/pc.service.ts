import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PC } from '../models/pc.model';

@Injectable({
  providedIn: 'root'
})
export class PcService {
  private readonly _$pcInfo: BehaviorSubject<PC | null> = new BehaviorSubject(null);

  get pcInfo() {
    return this._$pcInfo.asObservable();
  }

  constructor() { }

  getInfo(data: Object) {
    this._$pcInfo.next(new PC(data));
  }
}
