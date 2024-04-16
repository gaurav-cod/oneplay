import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError } from "rxjs";
import { of } from "rxjs/internal/observable/of";
import { environment } from "src/environments/environment";
import { ReferrerService } from "./referrer.service";
import {
  BilldeskPaymentRO,
  ClientTokenRO,
  CouponResponse,
  FilterPayload,
  GameSessionRO,
  GameStatusRO,
  GameTermCondition,
  GetLoginUrlRO,
  ILocation,
  IPayment,
  LoginDTO,
  LoginOtpRO,
  LoginRO,
  PurchaseStore,
  SetOnlineRO,
  SignupDTO,
  SpeedTestServerRO,
  StartGameRO,
  TerminateStreamRO,
  TokensUsageDTO,
  UpdateProfileDTO,
  UserAuthDTO,
  VerifySignupDTO,
  WebPlayTokenRO,
} from "../interface";
import { FriendModel } from "../models/friend.model";
import { GameModel } from "../models/game.model";
import { GameFeedModel } from "../models/gameFeed.model";
import { MessageModel } from "../models/message.model";
import { PartyModel } from "../models/party.model";
import { PartyInviteModel } from "../models/partyInvite.model";
import { PartyMemberModel } from "../models/partyMember.model";
import { GameSearch } from "../models/search.model";
import { Session } from "../models/session.model";
import { VideoFeedModel } from "../models/streamFeed.model";
import { SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { VideoModel } from "../models/video.model";
import { SubscriptionPaymentModel } from "../models/subscriptionPayment.modal";
import { UAParser } from "ua-parser-js";
import { GameplayHistoryModel } from "../models/gameplay.model";
import { SubscriptionPackageModel } from "../models/subscriptionPackage.model";
import { NotificationModel } from "../models/notification.model";
import { GamezopFeedModel } from "../models/gamezopFeed.model";
import { GamezopModel } from "../models/gamezop.model";
@Injectable({
  providedIn: "root",
})
export class RestService {
  private readonly client_api = environment.client_api;
  private readonly r_mix_api = environment.render_mix_api + "/v1";
  private readonly r_mix_api_2 = environment.render_mix_api + "/v2";
  private readonly r_mix_api_3 = environment.render_mix_api + "/v3";

  constructor(private readonly http: HttpClient, private readonly referrerService:ReferrerService) {}

  login(data: LoginDTO): Observable<{
    session_token: string;
    trigger_speed_test: boolean;
  }> {
    let device="web";
    const referrer = this.referrerService.getReferrer();
    if(referrer==="tizen"){
      device="tizen";
    }
    return this.http
      .post(this.r_mix_api + "/accounts/login", { ...data, device})
      .pipe(
        map((res) => ({
          session_token: res["session_token"],
          trigger_speed_test: res["trigger_speed_test"],
        })),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  signup(data: SignupDTO) {
    return this.http
      .post(this.r_mix_api + "/accounts/signup", {
        ...data,
        partnerId: environment.partner_id,
      })
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getName(id: string): Observable<string> {
    return this.http
      .get<string>(this.r_mix_api + "/accounts/" + id + "/name")
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getReferalName(id: string) {
    return this.http
      .post<any>(this.r_mix_api_3 + "/accounts/check_referral_code", {
        referral_code: id,
      })
      .pipe(
        map((res: any) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getProfile(): Observable<UserModel> {
    return this.http.get(this.r_mix_api + "/accounts/profile").pipe(
      map((res) => new UserModel(res)),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  updateProfile(data: UpdateProfileDTO): Observable<UserModel> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return this.http
      .put<object>(this.r_mix_api + "/accounts/profile", formData)
      .pipe(
        map((res) => new UserModel(res)),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  updatePassword(old_password: string, password: string): Observable<void> {
    return this.http
      .put(this.r_mix_api_2 + "/accounts/password", { old_password, password })
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  createPassword(password: string): Observable<void> {
    return this.http
      .put(this.r_mix_api + "/accounts/password", { password })
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  updateEmail(email: string): Observable<string> {
    return this.http
      .post(this.r_mix_api + "/accounts/update_email_request", { email })
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  resendEmailRequestUpdate() {
    return this.http
      .get(this.r_mix_api + "/accounts/resend_update_email_request_secret")
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  verifyEmailUpdate(code: string) {
    return this.http
      .post(this.r_mix_api + "/accounts/verify_update_email_request_secret", {
        code,
      })
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  resendUpdateEmail() {
    return this.http
      .get(this.r_mix_api + "/accounts/resend_update_email_secret")
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  resendEmailUpdate() {
    return this.http
      .get(this.r_mix_api + "/accounts/resend_update_email_secret")
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  confirmEmailUpdate(code: string) {
    return this.http
      .post(this.r_mix_api + "/accounts/verify_update_email_secret", { code })
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  updatePhone(phone: string): Observable<string> {
    return this.http
      .post(this.r_mix_api + "/accounts/update_phone_request", { phone })
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  resendPhoneRequestUpdate() {
    return this.http
      .get(this.r_mix_api + "/accounts/resend_update_phone_request_otp")
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  verifyPhoneUpdate(code: string) {
    return this.http
      .post(this.r_mix_api + "/accounts/verify_update_phone_request", { code })
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  resendPhoneUpdate() {
    return this.http
      .get(this.r_mix_api + "/accounts/resend_update_phone_otp")
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  confirmPhoneUpdate(code: string) {
    return this.http
      .post(this.r_mix_api + "/accounts/verify_update_phone", { code })
      .pipe(
        map((res) => res["msg"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  verify(data: VerifySignupDTO): Observable<string> {
    return this.http
      .post<object>(this.r_mix_api + "/accounts/verify_signup", data)
      .pipe(
        map((res) => res["session_token"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  resendVerificationLink(email: string, password: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/resend_signup_email", {
        email,
        password,
      })
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  sendOTP(token: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/send_otp/" + token, null)
      .pipe(
        map((res) => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  requestResetPassword(email: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/request_reset_password/" + email, null)
      .pipe(
        map((res) => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }
  requestResetPasswordWithMobile(mobile: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/request_reset_password_with_phone", {
        phone: mobile,
      })
      .pipe(
        map((res) => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }
  verifyOTPForMobile(mobile: string, otp: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/get_password_reset_token", {
        phone: mobile,
        code: otp,
      })
      .pipe(
        map((res: any) => res.token),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/reset_password", { token, password })
      .pipe(
        map((res) => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  verifyUserName(username: string): Observable<string> {
    return this.http
      .post(this.r_mix_api + "/accounts/validate_username", { username })
      .pipe(
        map((res) => res["success"] ?? false),
        map((res) => (res ? "" : "Invalid username.")),
        catchError(({ error }) => {
          if (error.code === 400) return of(error.message);
          else throw error;
        })
      );
  }

  getSessions(): Observable<Session[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/accounts/sessions")
      .pipe(map((res) => res.map((d) => new Session(d))));
  }

  getGameplayHistory(
    page_number: number,
    entries_per_page: number
  ): Observable<GameplayHistoryModel[]> {
    const formData = new FormData();
    formData.append("page_number", page_number.toString());
    formData.append("entries_per_page", entries_per_page.toString());
    return this.http
      .post<any>(this.client_api + "/game_session_history", formData)
      .pipe(
        map((res) => res.data.result.map((d) => new GameplayHistoryModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  deleteSession(key: string): Observable<void> {
    return this.http.delete(this.r_mix_api + "/accounts/sessions/" + key).pipe(
      map(() => {}),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  payWithStripe(planID: string, coupon_code?: string): Observable<IPayment> {
    return this.http
      .post<IPayment>(
        this.r_mix_api + "/accounts/subscription/" + planID + "/pay",
        coupon_code ? { coupon_code } : null
      )
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getSubscriptionPackage(planID: string): Observable<SubscriptionPackageModel> {
    return this.http
      .get<SubscriptionPackageModel>(
        this.r_mix_api + "/accounts/subscription/" + planID + "/info"
      )
      .pipe(
        map((res) => new SubscriptionPackageModel(res)),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  payWithBilldesk(
    planID: string,
    coupon_code?: string
  ): Observable<BilldeskPaymentRO> {
    return this.http
      .post<BilldeskPaymentRO>(
        this.r_mix_api + "/accounts/subscription/" + planID + "/pay-billdesk",
        coupon_code ? { coupon_code } : null
      )
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  payWithPhonePay(planId: string): Observable<string> {
    return this.http
      .post<string>(
        this.r_mix_api + "/accounts/subscription/" + planId + "/pay-phonepe",
        {}
      )
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  cancelPayment(paymentId: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/payment/" + paymentId + "/cancel", null)
      .pipe(
        map(() => {}),
        catchError(({ err }) => {
          throw err;
        })
      );
  }

  getSubscriptions(
    page: number,
    limit: number
  ): Observable<SubscriptionModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/accounts/subscription/all", {
        params: { page, limit },
      })
      .pipe(
        map((res) => res.map((d) => new SubscriptionModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getCurrentSubscription(): Observable<SubscriptionModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/accounts/subscription/current")
      .pipe(
        map((res) => res.map((d) => new SubscriptionModel(d))),
        catchError((err) => {
          throw err.error;
        })
      );
  }

  getProcessingSubscription(
    page: number,
    limit: number
  ): Observable<SubscriptionPaymentModel[]> {
    return this.http
      .get<any[]>(
        this.r_mix_api + "/accounts/subscription/payment-history/processing",
        { params: { page, limit } }
      )
      .pipe(
        map((res) => res.map((d) => new SubscriptionPaymentModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getFailedSubscription(
    page: number,
    limit: number
  ): Observable<SubscriptionPaymentModel[]> {
    return this.http
      .get<any[]>(
        this.r_mix_api + "/accounts/subscription/payment-history/failed",
        { params: { page, limit } }
      )
      .pipe(
        map((res) => res.map((d) => new SubscriptionPaymentModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  hasPreviousPayments(): Observable<boolean> {
    return this.http
      .get<any[]>(this.r_mix_api + "/accounts/subscription/payment-history/all")
      .pipe(map((res) => res.length > 0));
  }

  checkIfPaymentReciptDownload(planId: string) {
    return this.http
      .get(this.r_mix_api + `/subscriptions/payment/${planId}/receipt`)
      .pipe(
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getPaymentRecipt(planId: string) {
    const header = new HttpHeaders({
      "Content-Type": "application/pdf",
    });
    return this.http.get(
      this.r_mix_api + `/subscriptions/payment/${planId}/receipt`,
      {
        responseType: "blob",
        headers: header,
      }
    );
  }

  setOnline(): Observable<SetOnlineRO> {
    return this.http
      .post<SetOnlineRO>(this.r_mix_api + "/accounts/online", null)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getOnlineStatus(userId: string): Observable<boolean> {
    return this.http.get(this.r_mix_api + "/accounts/online/" + userId).pipe(
      map((res) => res["status"]),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  getWishlist(): Observable<string[]> {
    return this.http.get<string[]>(this.r_mix_api + "/accounts/wishlist").pipe(
      map((res) => res),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  addWishlist(gameId: string): Observable<any> {
    return this.http
      .post(this.r_mix_api + "/accounts/add_to_wishlist/" + gameId, null)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  removeWishlist(gameId: string): Observable<any> {
    return this.http
      .post(this.r_mix_api + "/accounts/remove_from_wishlist/" + gameId, null)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  generateQRCode() {
    return this.http
      .post<{ code: string; token: string }>(
        this.r_mix_api + "/accounts/qr/generate",
        null
      )
      .pipe();
  }

  getQRSession(code: string, token: string) {
    return this.http
      .post<{ sessionToken: string }>(
        this.r_mix_api + "/accounts/qr/get_session",
        { code, token }
      )
      .pipe();
  }

  setQRSession(code: string, token: string) {
    return this.http
      .post(this.r_mix_api + "/accounts/qr/verify_code", { code, token })
      .pipe(
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getNearestSpeedTestServer(): Observable<SpeedTestServerRO> {
    return this.http
      .get<SpeedTestServerRO>(this.r_mix_api + "/games/speed-test-server")
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  sendSpeedTestDLPacket(url: string, packetSize: number) {
    return this.http.post(
      url,
      { size: packetSize, id: 1 },
      { responseType: "arraybuffer" }
    );
  }

  sendSpeedTestULPacket(url: string, index: string, file: Blob) {
    const formData = new FormData();
    formData.append("id", index);
    formData.append("file", file);
    return this.http.post(url, formData);
  }

  getGameDetails(id: string, params?: any): Observable<GameModel> {
    return this.http
      .get(this.r_mix_api + "/games/" + id + "/info", { params })
      .pipe(
        map((res) => new GameModel(res)),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getTip(): Observable<string[]> {
    const formData = new FormData();
    const ua = new UAParser();
    let clientType: "web" | "windows" | "mac" | "android_mobile" | "android_tv";

    switch (ua.getOS().name) {
      case "Windows":
        clientType = "windows";
        break;
      case "Mac OS":
        clientType = "mac";
        break;
      case "Android":
        if (ua.getDevice().type === "smarttv") {
          clientType = "android_tv";
        } else {
          clientType = "android_mobile";
        }
        break;
      default:
        clientType = "web";
        break;
    }

    formData.append("client_type", clientType);
    formData.append("client_version", environment.appVersion);
    formData.append("type", "tips");
    return this.http.post(this.client_api + "/get_config", formData).pipe(
      map((res) => res["data"]?.find((d) => d.type === "tips")?.tips ?? []),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  searchUsers(
    query: string,
    page: number,
    limit: number
  ): Observable<UserModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/accounts/search/", {
        params: { query, page, limit },
      })
      .pipe(
        map((res) => res.map((d) => new UserModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  search(
    query: string,
    page: number,
    limit: number,
    status?: "live" | "unlive"
  ): Observable<GameSearch> {
    const params = { query, page, limit };
    if (status) {
      params["status"] = status;
    }
    return this.http
      .get<any[]>(this.r_mix_api + "/games/search", {
        params,
      })
      .pipe(
        map((res) => new GameSearch(res)),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getSimilarGames(id: string): Observable<GameModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/games/" + id + "/similar", {
        params: {
          textBackground: window.innerWidth > 485 ? "290x185" : "200x127",
        },
      })
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getTopGenres(limit: number): Observable<string[]> {
    return this.http
      .get<string[]>(this.r_mix_api + "/games/top_genres", {
        params: { limit },
      })
      .pipe();
  }

  getTopPublishers(limit: number): Observable<string[]> {
    return this.http
      .get<string[]>(this.r_mix_api + "/games/top_publishers", {
        params: { limit },
      })
      .pipe();
  }

  getTopDevelopers(limit: number): Observable<string[]> {
    return this.http
      .get<string[]>(this.r_mix_api + "/games/top_developers", {
        params: { limit },
      })
      .pipe();
  }

  getGamesByGenre(genre: string): Observable<GameModel[]> {
    const data = {
      genres: genre,
      order_by: "trend_score:desc",
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data, {
        params: {
          textBackground: window.innerWidth > 485 ? "290x185" : "200x127",
        },
      })
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getGamesByDeveloper(developer: string): Observable<GameModel[]> {
    const data = {
      developer,
      order_by: "trend_score:desc",
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data, {
        params: {
          textBackground: window.innerWidth > 485 ? "290x185" : "200x127",
        },
      })
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getFilteredGames(
    query: { [key: string]: string },
    page: number,
    limit: number = 12
  ): Observable<GameModel[]> {
    const data = {
      order_by: "release_date:desc",
      ...query,
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data, {
        params: { page, limit },
      })
      .pipe(
        map((res) => res.map((d) => new GameModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getFilteredGamesV2(
    query: { [key: string]: string },
    payload: FilterPayload,
    page: number,
    limit: number = 12
  ): Observable<(GameModel | GamezopModel)[]> {
    let data = {
      ...payload
    };
    if (query?.genres)
      data = { ...data, ...query};
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data,{
        params: { page, limit },
      })
      .pipe(
        map((res) => res.map((d) => new GameModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }
  getFilteredCasualGamesV2(
    category: string | null,
    payload: FilterPayload,
    page: number,
    limit: number = 12
  ): Observable<GamezopModel[]> {
    let data = {
      ...payload
    };
    if (category)  {
      data = {
        ...data,
        categories: category,
        genres: category
      }
    }
    return this.http
      .post<any[]>(this.r_mix_api + "/games/gamezop/get_filtered_games", data,{
        params: { page, limit },
      })
      .pipe(
        map((res: any) => {
          return res.games.map((d) => new GamezopModel(d))}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getWishlistGames(ids: string[]): Observable<GameModel[]> {
    if (ids.length === 0) {
      return of([]);
    }
    const data = {
      content_ids: ids.join(","),
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data)
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getAllGames(page: number): Observable<GameModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/games", { params: { page, limit: 10 } })
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getHomeFeed(params?: any): Observable<(VideoFeedModel | GamezopFeedModel | GameFeedModel)[]> {
    
    return this.http
      .get<any[]>(this.r_mix_api_2 + "/games/feed/personalized", { params })
      .pipe(
        map((res: any) => res.feeds.map((d) => {
          if (d.type == "landscape_video")
            return new VideoFeedModel(d);
          else if (d.type == "square_category_small")
            return new GamezopFeedModel(d);
          else
            return new GameFeedModel(d);
        })),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getStreamsFeed(): Observable<VideoFeedModel[]> {
    return this.http.get<any[]>(this.r_mix_api + "/streams").pipe(
      map((res) => res.map((d) => new VideoFeedModel(d))),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  getVideos(id: string): Observable<VideoModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/streams/" + id)
      .pipe(map((res) => res.map((d: any) => new VideoModel(d))));
  }

  getLiveVideos(id: string): Observable<VideoModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/streams/" + id + "?eventType=live")
      .pipe(map((res) => res.map((d: any) => new VideoModel(d))));
  }

  getAllFriends(): Observable<FriendModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/friends/all")
      .pipe(map((res) => res.map((d) => new FriendModel(d))));
  }

  getPendingSentRequests(): Observable<FriendModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/friends/pending_sent_requests")
      .pipe(map((res) => res.map((d) => new FriendModel(d))));
  }

  getPendingReceivedRequests(): Observable<FriendModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/friends/pending_received_requests")
      .pipe(map((res) => res.map((d) => new FriendModel(d))));
  }

  addFriend(id: string): Observable<string> {
    return this.http
      .post(this.r_mix_api + "/social/friends/" + id + "/send_request", null)
      .pipe(
        map((data) => data["id"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  acceptFriend(id: string): Observable<void> {
    return this.http
      .put(this.r_mix_api + "/social/friends/" + id + "/accept_request", null)
      .pipe(
        map((data) => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  deleteFriend(id: string): Observable<void> {
    return this.http.delete<any>(this.r_mix_api + "/social/friends/" + id).pipe(
      map(() => {}),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  createParty(data: any): Observable<PartyModel> {
    return this.http.post<any>(this.r_mix_api + "/social/groups", data).pipe(
      map((res) => new PartyModel(res)),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  updateParty(id: string, data: any): Observable<void> {
    return this.http.put(this.r_mix_api + "/social/groups/" + id, data).pipe(
      map(() => {}),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  getParties(): Observable<PartyModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/groups/all")
      .pipe(map((res) => res.map((d) => new PartyModel(d))));
  }

  getPartyMembers(id: string): Observable<PartyMemberModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/groups/" + id + "/members")
      .pipe(map((res) => res.map((d) => new PartyMemberModel(d))));
  }

  inviteToParty(id: string, userId: string): Observable<PartyInviteModel> {
    return this.http
      .post(this.r_mix_api + "/social/groups/" + id + "/invite/" + userId, null)
      .pipe(
        map((data) => {
          return new PartyInviteModel(data);
        }),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getPartyInvites(): Observable<PartyInviteModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/groups/invites/received")
      .pipe(map((res) => res.map((d) => new PartyInviteModel(d))));
  }

  getPartyInvitesByGroupId(id: string): Observable<PartyInviteModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/groups/" + id + "/invites")
      .pipe(map((res) => res.map((d) => new PartyInviteModel(d))));
  }

  acceptPartyInvite(groupId: string): Observable<void> {
    return this.http
      .put(
        this.r_mix_api + "/social/groups/" + groupId + "/accept_invite",
        null
      )
      .pipe(
        map((data) => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  rejectPartyInvite(groupId: string): Observable<void> {
    return this.http
      .put(
        this.r_mix_api + "/social/groups/" + groupId + "/reject_invite",
        null
      )
      .pipe(
        map((data) => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getDirectMessages(
    friendId: string,
    skip: number,
    limit: number
  ): Observable<MessageModel[]> {
    return this.http
      .get<any[]>(
        this.r_mix_api + "/social/friends/" + friendId + "/messages",
        { params: { skip, limit } }
      )
      .pipe(map((res) => res.map((d) => new MessageModel(d))));
  }

  getGroupMessages(groupId: string): Observable<MessageModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/groups/" + groupId + "/messages")
      .pipe(map((res) => res.map((d) => new MessageModel(d))));
  }

  getStreamMessages(streamId: string): Observable<MessageModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/streams/" + streamId + "/messages")
      .pipe(map((res) => res.map((d) => new MessageModel(d))));
  }

  getLocation(ip: string): Observable<ILocation> {
    return this.http.get<ILocation>(this.r_mix_api + "/location/" + ip).pipe(
      map((res) => res),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  getCurrentLocation(): Observable<ILocation> {
    return this.http.get<ILocation>(this.r_mix_api + "/location").pipe();
  }

  addDevice(token: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/notification/push/device/" + token, null)
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getSeriousNotification(): Observable<string | null> {
    return this.http
      .get(this.r_mix_api + "/notification/serious", {
        params: { partnerId: environment.partner_id, platform: "web" },
      })
      .pipe(
        map((res) => res["text"]),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  canStartGame() {
    return this.http
    .get(this.r_mix_api + "/subscriptions/can_start_game")
    .pipe(
      map((res) => res),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  startGame(
    gameId: string,
    resolution: string,
    is_vsync_enabled: boolean,
    fps: number,
    bitrate: number,
    advanced_options: any,
    store?: PurchaseStore
  ): Observable<StartGameRO> {
    const payload = {
      resolution,
      is_vsync_enabled,
      fps,
      bitrate,
      ...advanced_options,
    };
    if (store) {
      payload["store"] = store.name.replace(/\s/g, "").toLowerCase();
    }
    const formData = new FormData();
    formData.append("game_id", gameId);
    formData.append("launch_payload", JSON.stringify(payload));
    return this.http
      .post<StartGameRO>(this.client_api + "/start_game", formData)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }
  getTermsConditionForGame(
    gameId: string,
    store?: PurchaseStore
  ): Observable<GameTermCondition> {
    const formData = new FormData();
    formData.append("game_id", gameId);
    formData.append("store", store.name.replace(/\s/g, "").toLowerCase());
    return this.http
      .post<GameTermCondition>(this.client_api + "/install_n_play", formData)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getClientToken(sessionId: string): Observable<ClientTokenRO> {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    return this.http.post(this.client_api + "/get_session", formData).pipe(
      map((res) => res["data"]),
      catchError(({ error }) => {
        throw error;
      })
    );
  }

  getWebPlayToken(sessionId: string): Observable<WebPlayTokenRO> {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    return this.http
      .post<WebPlayTokenRO>(this.client_api + "/get_web_play_token", formData)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  terminateGame(sessionId: string): Observable<TerminateStreamRO> {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    return this.http
      .post<TerminateStreamRO>(this.client_api + "/terminate_stream", formData)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getGameStatus(): Observable<GameStatusRO | null> {
    const formData = new FormData();
    return this.http
      .post(this.client_api + "/get_any_active_session_status", formData)
      .pipe(
        map((res) => (!!Object.keys(res["data"]).length ? res["data"] : null)),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getGameSession(launchKey: string): Observable<GameSessionRO> {
    return this.http
      .get<GameSessionRO>(this.r_mix_api + "/logging/game_session/" + launchKey)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  saveFeedback(feedback: any): Observable<void> {
    return this.http
      .post<void>(this.r_mix_api + "/logging/feedback", feedback)
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  deleteSessionData(): Observable<void> {
    return this.http
      .post<void>(this.client_api + "/delete_user_data", new FormData())
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  postAReport(
    message: string,
    response: any,
    error_code: string
  ): Observable<void> {
    return this.http
      .post<void>(this.r_mix_api + "/logging/report", {
        message,
        response,
        error_code,
      })
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  setSearchPrivacy(isPrivate: boolean): Observable<void> {
    return this.http
      .put<void>(this.r_mix_api + "/accounts/set_search_privacy", {
        search_privacy: isPrivate,
      })
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getTokensUsage(): Observable<TokensUsageDTO> {
    return this.http
      .get<TokensUsageDTO>(
        this.r_mix_api + "/accounts/subscription/remaining_stream_time"
      )
      .pipe(
        map((data) => data),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getGameStores(): Observable<PurchaseStore[]> {
    return this.http
      .get<PurchaseStore[]>(this.r_mix_api + "/games/stores")
      .pipe(
        map((data) => data),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  setPreferredStoreForGame(id: string, storeName: string): Observable<boolean> {
    return this.http
      .post(this.r_mix_api + "/games/set_preferred_store/", {
        game_id: id,
        store: storeName,
      })
      .pipe(
        map((res) => res["success"] ?? false),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  applyCoupon(
    subscriptionPackageId: string,
    couponCode: string
  ): Observable<CouponResponse> {
    return this.http
      .post<CouponResponse>(
        this.r_mix_api + "/accounts/subscription/apply_coupon",
        {
          subscription_package_id: subscriptionPackageId,
          coupon_code: couponCode,
        }
      )
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  checkCasualGamingSession() {
    return this.http.get(this.r_mix_api + "/games/gamezop/is_free").pipe(
      map((res) => res),
      catchError(({ error }) => {
        throw error;
      })
    );
  }
  visitCasulGamingSection() {
    return this.http
      .post<void>(this.r_mix_api + "/games/gamezop/visit", null)
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  // Notification API's
  getAllUserNotifications(page: number, limit: number) {
    return this.http
      .get<any>(
        this.r_mix_api + `/notification/all?page=${page}&limit=${limit}`
      )
      .pipe(
        map((res) => ({
          notifications: (res.notifications as object[]).map(
            (d) => new NotificationModel(d)
          ),
          total: res.total as number,
        }))
      );
  }
  markNotificationRead(id: string) {
    return this.http.put<string>(
      this.r_mix_api + `/notification/${id}/read`,
      {}
    );
  }
  markNotificationUnRead(id: string) {
    return this.http.put<string>(
      this.r_mix_api + `/notification/${id}/unread`,
      {}
    );
  }
  markAllNotificationRead() {
    return this.http.put<void>(this.r_mix_api + `/notification/read_all`, {});
  }
  markNotificationsSeen() {
    return this.http.put<void>(this.r_mix_api + `/notification/seen`, {});
  }
  deleteNotification(id: string) {
    return this.http.delete<void>(
      this.r_mix_api + `/notification/${id}/delete`
    );
  }

  // gamezop API
  getGamezopFeed(category: string, railLimit: number = 50): Observable<GamezopFeedModel[]> {
    const cat = encodeURIComponent(category);
    return this.http
      .get<any[]>(this.r_mix_api + `/games/gamezop/feeds?category=${cat}&railLimit=${railLimit}`)
      .pipe(
        map((res) => res.map((d) => new GamezopFeedModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getGamezopCategory(params?: any): Observable<string[]> {
    return this.http
      .get<string[]>(this.r_mix_api + "/games/gamezop/categories", { params })
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  getGamezopFilteredGames(
    query: { [key: string]: string },
    page: number,
    limit: number = 12
  ): Observable<GamezopModel[]> {
    const data = {
      order_by: "release_date:desc",
      ...query,
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/gamezop/get_filtered_games", data, {
        params: { page, limit },
      })
      .pipe(
        map((res: any) => res.games.map((d) => new GamezopModel(d))),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  downloadPDF(pdfLink: string): Observable<Blob> {
    const header = new HttpHeaders({
      "Content-Type": "application/pdf",
    });
    return this.http.get(pdfLink, {
      responseType: "blob",
      headers: header,
    });
  }

  // * V3 Guest User Login API

  // ? Should not be POST method should be PUT
  isPhoneRegistred(phone: string, device: "web" | "tizen") {
   
    return this.http
      .post(this.r_mix_api_3 + "/accounts/check_phone_number", {
        phone: phone,
        device: device,
      })
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw error;
        })
      );
  }
  getLogInURL() {
    return this.http.post<GetLoginUrlRO>(
      this.r_mix_api_3 + "/accounts/get_login_url",
      {
        platform: "angular",
      }
    );
  }

  getLoginOTP(userRegistration: UserAuthDTO) {
    return this.http
      .post<boolean>(
        this.r_mix_api_3 + "/accounts/get_login_otp",
        userRegistration
      )
      .pipe(
        (map((res: any) => res.success),
        catchError(({ error }) => {
          throw error;
        }))
      );
  }

  resendOTP(userRegistration: UserAuthDTO) {
    return this.http
      .post<boolean>(
        this.r_mix_api_3 + "/accounts/get_login_otp",
        userRegistration
      )
      .pipe(
        (map((res: any) => res.success),
        catchError(({ error }) => {
          throw error;
        }))
      );
  }

  verifyOTP(userRegistration: UserAuthDTO) {
    return this.http
      .post<LoginOtpRO>(
        this.r_mix_api_3 + "/accounts/login_with_otp",
        userRegistration
      )
      .pipe(
        map((res) => ({
          ...res,
          profile: new UserModel(res.profile),
        })),
        catchError(({ error }) => {
          throw error;
        })
      );
  }
  loginWithPassword(userRegistration: UserAuthDTO) {
    return this.http
      .post<LoginRO>(this.r_mix_api_3 + "/accounts/login", userRegistration)
      .pipe(
        map((res) => ({
          ...res,
          profile: new UserModel(res.profile),
        })),
        catchError(({ error }) => {
          throw error;
        })
      );
  }

  setRemindLater() {
    return this.http
      .post<void>(this.r_mix_api_3 + "/accounts/set_remind_later", null)
      .pipe(map((res: any) => res));
  }

  delteRemindLater() {
    return this.http
      .post<void>(this.r_mix_api_3 + "/accounts/delete_remind_later", null)
      .pipe(map((res: any) => res));
  }

  // Live Stream Configuration API's
  getAllStreamConfigs() {
    return this.http.get<any[]>(this.r_mix_api + "/streams/config/saved").pipe((map((res: any)=> res.results)))
  }

  addKeyToStreamConfig(service: string, key: string) {
    return this.http.post(this.r_mix_api + "/streams/config/key", { service, key }).pipe((map((res)=> res)), catchError(({ error }) => { throw error; }))
  }

  setPreferedStreamConfig(id: string) {
    return this.http.post(this.r_mix_api + "/streams/config/prefered", { id: id }).pipe((map((res)=> res)), catchError(({ error }) => { throw error; }))
  }

  addCustomStreamConfig(service: string, key: string, url: string) {
    return this.http.post(this.r_mix_api + "/streams/config/custom", { service: service, key: key, url: url  }).pipe((map((res)=> res), catchError(({ error })=> { throw error; })))
  }

  updateCustomStreamConfig(id: string, key: string) {
    return this.http.put(this.r_mix_api + `/streams/config/custom/${id}`, { key: key }).pipe((map((res)=> res)), catchError(({ error })=> { throw error; }))
  }

  deleteStreamConfig(id: string) {
    return this.http.delete(this.r_mix_api + `/streams/config/${id}`).pipe((map((res)=> res)), catchError(({ error })=> { throw error; }))
  }
}
