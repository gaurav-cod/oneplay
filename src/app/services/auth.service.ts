import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { UserModel } from "../models/user.model";
import * as Cookies from "js-cookie";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly _$user: BehaviorSubject<UserModel | null> =
    new BehaviorSubject(null);

  private readonly _$wishlist: BehaviorSubject<string[]> = new BehaviorSubject(
    []
  );

  get user() {
    return this._$user.asObservable();
  }

  get wishlist() {
    return this._$wishlist.asObservable();
  }

  set wishlist(list: Observable<string[]>) {
    list.subscribe((res) => this._$wishlist.next(res));
  }

  get sessionToken() {
    const obj = Cookies.getJSON("op_user");
    if (obj) {
      return new UserModel(obj).token;
    }
    return "";
  }

  get sessionKey() {
    if (this.sessionToken) {
      const str = atob(this.sessionToken);
      const [userid, token] = str.split(":");
      return `user:${userid}:session:${token}`;
    }
    return "";
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

  updateProfile(userObj: Partial<UserModel>) {
    const user = this._$user.value;
    const newUser = user.copyWith(userObj);
    Cookies.set("op_user", newUser.json);
    this._$user.next(newUser);
  }

  logout() {
    Cookies.remove("op_user");
    this._$user.next(null);
  }

  addToWishlist(id: string) {
    const wishlist = this._$wishlist.value;
    if (!wishlist.includes(id)) {
      wishlist.push(id);
      this._$wishlist.next(wishlist);
    }
  }

  removeFromWishlist(id: string) {
    const wishlist = this._$wishlist.value;
    const index = wishlist.indexOf(id);
    if (index > -1) {
      wishlist.splice(index, 1);
      this._$wishlist.next(wishlist);
    }
  }
}
