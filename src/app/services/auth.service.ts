import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { UserModel } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly _$user: BehaviorSubject<UserModel | null> =
    new BehaviorSubject(null);

  private readonly _$wishlist: BehaviorSubject<string[]> = new BehaviorSubject(
    []
  );

  private readonly _$sessionToken: BehaviorSubject<string | null> =
    new BehaviorSubject(null);

  constructor() {
    const sessionToken = localStorage.getItem("op_session_token");
    if (sessionToken) {
      this._$sessionToken.next(sessionToken);
    }
  }

  get user() {
    return this._$user.asObservable();
  }

  set user(userObservable: Observable<UserModel>) {
    userObservable.subscribe((user) => this._$user.next(user));
  }

  get wishlist() {
    return this._$wishlist.asObservable();
  }

  set wishlist(list: Observable<string[]>) {
    list.subscribe((res) => this._$wishlist.next(res));
  }

  get sessionTokenExists() {
    return this._$sessionToken.asObservable().pipe(map((token) => !!token));
  }

  get sessionToken() {
    return localStorage.getItem("op_session_token") || '';
  }

  get userIdAndToken() {
    if (this.sessionToken) {
      const str = atob(this.sessionToken);
      const [userid, token] = str.split(":");
      return { userid, token };
    }
    return { userid: "", token: "" };
  }

  get sessionKey() {
    const { userid, token } = this.userIdAndToken;
    return `user:${userid}:session:${token}`;
  }

  login(sessionToken: string) {
    localStorage.setItem("op_session_token", sessionToken);
    this._$sessionToken.next(sessionToken);
  }

  updateProfile(userObj: Partial<UserModel>) {
    const user = this._$user.value;
    const newUser = user.copyWith(userObj);
    this._$user.next(newUser);
  }

  logout() {
    localStorage.removeItem("op_session_token");
    this._$sessionToken.next(null);
    this._$user.next(null);
    this._$wishlist.next([]);
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
