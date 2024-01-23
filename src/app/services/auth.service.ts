import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { UserModel } from "../models/user.model";
import Cookies from "js-cookie";
import { environment } from "src/environments/environment";
import * as moment from "moment";

declare const Countly: any;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly _$user: BehaviorSubject<UserModel | null> =
    new BehaviorSubject(null);

  private readonly _$wishlist: BehaviorSubject<string[]> = new BehaviorSubject([]);

  private readonly _$sessionToken: BehaviorSubject<string | null> =
    new BehaviorSubject(null);

  private readonly _$triggerWishlist: BehaviorSubject<boolean> =
    new BehaviorSubject(false);

  private readonly _$triggerProfileOverlay: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private readonly _$triggerInitialModal: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private isUserLogginFlow: boolean = false;
  private loggedInUsername: string | null = null;
  private remindLaterForUserInfo: boolean = false;
  private isDeafultUsernameGiven: boolean = false;

  loggedOutByUser: boolean = false;
  trigger_speed_test: boolean = false;

  constructor() {
    const sessionToken = Cookies.get("op_session_token");
    if (sessionToken) {
      this._$sessionToken.next(sessionToken);
    }
  }

  get getUserLogginFlow() {
    return this.isUserLogginFlow;
  }
  setUserLogginFlow(value: boolean) {
    this.isUserLogginFlow = value;
  }

  get userInfoForRemindLater() {
    return this.remindLaterForUserInfo;
  }
  setUserInfoRemindLater(value: boolean) {
    this.remindLaterForUserInfo = value;
  }

  get defaultUsernameGiven() {
    return this.isDeafultUsernameGiven;
  }
  setDefaultUsernameGiven(value: boolean) {
    this.isDeafultUsernameGiven = value;
  }

  get getLoggedInUserName() {
    return this.loggedInUsername;
  }
  setLoggedInUserName(value: string) {
    this.loggedInUsername = value;
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

  setWishlist(list: string[]) {
    this._$wishlist.next(list);
    this._$triggerWishlist.next(list.length < 1);
  }

  get profileOverlay() {
    return this._$triggerProfileOverlay.asObservable();
  }
  setProfileOverlay(value: boolean) {
    this._$triggerProfileOverlay.next(value);
  }

  get triggerInitialModal() {
    return this._$triggerInitialModal.asObservable();
  }
  setTriggerInitialModal(value: boolean) {
    this._$triggerInitialModal.next(value);
  }

  get sessionTokenExists() {
    return this._$sessionToken
      .asObservable()
      .pipe<boolean>(map((token) => !!token));
  }

  get sessionToken() {
    return Cookies.get("op_session_token") || "";
  }

  // get userCanGame() {
  //   return this._$user.asObservable().pipe<boolean | undefined>(
  //     map((user) => {
  //       return !!user;
  //     })
  //   );
  // }

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

  get triggerWishlist() {
    return this._$triggerWishlist.asObservable();
  }

  openWishlist() {
    this._$wishlist.next([...this._$wishlist.value]);
    this._$triggerWishlist.next(true);
  }

  login(sessionToken: string) {
    Cookies.set("op_session_token", sessionToken, {
      domain: environment.cookie_domain,
      path: "/",
      expires: moment().add(90, "days").toDate(),
    });
    this._$sessionToken.next(sessionToken);
  }

  updateProfile(userObj: Partial<UserModel>) {
    const user = this._$user.value;
    const newUser = user.copyWith(userObj);
    this._$user.next(newUser);
  }

  logout() {
    this.trigger_speed_test = false;
    Cookies.remove("op_session_token", {
      domain: environment.cookie_domain,
      path: "/",
    });
    Countly.enable_offline_mode();
    this._$sessionToken.next(null);
    setTimeout(() => {
      this._$user.next(null);
      this._$wishlist.next([]);
    }, 100);
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
      this._$triggerWishlist.next(wishlist.length < 1);
    }
  }
}
