import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserModel } from '../models/user.model';
import * as Cookies from 'js-cookie';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _$user: BehaviorSubject<UserModel | null> = new BehaviorSubject(null);

  get user() {
    return this._$user.asObservable();
  }

  get sessionToken() {
    const obj = Cookies.getJSON("op_user");
    if (obj) {
      return new UserModel(obj).token;
    }
    return '';
  }

  constructor() {
    const obj = Cookies.getJSON("op_user");
    if (obj) {
      this._$user.next(new UserModel(obj));
    }
  }

  login(userObj: Object) {
    Cookies.set("op_user", userObj);
    this._$user.next(new UserModel(userObj));
  }

  logout() {
    Cookies.remove("op_user");
    this._$user.next(null);
  }
}
