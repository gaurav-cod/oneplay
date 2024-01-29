import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, map, Observable, Subscription } from "rxjs";
import { UserModel } from "../models/user.model";
import Cookies from "js-cookie";
import { environment } from "src/environments/environment";
import * as moment from "moment";
import { Router } from "@angular/router";

declare const Countly: any;

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  private readonly _$user: BehaviorSubject<UserModel | null> =
    new BehaviorSubject(null);

  private readonly _$triggerUserInfoModal: BehaviorSubject<boolean> =
    new BehaviorSubject(null);

  private readonly _$wishlist: BehaviorSubject<string[]> = new BehaviorSubject([]);

  private readonly _$sessionToken: BehaviorSubject<string | null> =
    new BehaviorSubject(null);

  private readonly _$triggerWishlist: BehaviorSubject<boolean> =
    new BehaviorSubject(false);

  private readonly _$triggerProfileOverlay: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private readonly _$triggerInitialModal: BehaviorSubject<boolean> = new BehaviorSubject(true);

  private readonly _$triggerPlayGame: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private isNotificationAlreadySubscribed: boolean = false;

  private _timerIntervalRef: NodeJS.Timer;

  private timerToShowUserInfo: number = 60;

  private isUserLogginFlow: boolean = false;
  private loggedInUsername: string | null = null;
  // temporary varibles
  private remindLaterForUserInfo: boolean = false;
  private isDeafultUsernameGiven: boolean = false;
  private defaultUsername: string | null = null;

  loggedOutByUser: boolean = false;
  trigger_speed_test: boolean = false;

  constructor(
    private readonly router: Router
  ) {
    const sessionToken = Cookies.get("op_session_token");
    if (sessionToken) {
      this._$sessionToken.next(sessionToken);
    }
  }
  ngOnDestroy() {
    clearInterval(this._timerIntervalRef);
  }

  startTimerToShowUserInfo() {
    this._timerIntervalRef = setInterval(()=> {
      this.timerToShowUserInfo--;
      if (!localStorage.getItem("showUserInfoModal")) {
        clearInterval(this._timerIntervalRef);
      }
      else if (this.timerToShowUserInfo === 0) {
        clearInterval(this._timerIntervalRef);
          this.setUserInfoModal(true);
      }
    }, 1000);
  }
  get getTimerToShowUserInfo() {
    return this.timerToShowUserInfo;
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


  get notificationAlreadySubscribed() {
    return this.isNotificationAlreadySubscribed;
  }
  setIsNotificationSubscribed(value: boolean) {
    this.isNotificationAlreadySubscribed = value;
  }


  get triggerPlayGame() {
    return this._$triggerPlayGame.asObservable();
  }
  setTriggerPlayGame(value: boolean) {
    this._$triggerPlayGame.next(value);
  }

  get profileOverlay() {
    return this._$triggerProfileOverlay.asObservable();
  }
  setProfileOverlay(value: boolean) {
    this._$triggerProfileOverlay.next(value);
  }

  get userInfoModal() {
    return this._$triggerUserInfoModal.asObservable();
  }
  setUserInfoModal(value: boolean) {
    this._$triggerUserInfoModal.next(value);
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
