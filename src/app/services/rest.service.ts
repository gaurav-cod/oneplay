import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError } from "rxjs";
import { environment } from "src/environments/environment";
import {
  HomeFeeds,
  LoginDTO,
  PaytmTxn,
  SignupDTO,
  StartPcRO,
  UpdateProfileDTO,
} from "../interface";
import { FriendModel } from "../models/friend.model";
import { GameModel } from "../models/game.model";
import { GameFeedModel } from "../models/gameFeed.model";
import { MessageModel } from "../models/message.model";
import { PC } from "../models/pc.model";
import { Session } from "../models/session.model";
import { VideoFeedModel } from "../models/streamFeed.model";
import { UserModel } from "../models/user.model";
import { VideoModel } from "../models/video.model";
import { AuthService } from "./auth.service";
import { PcService } from "./pc.service";

@Injectable({
  providedIn: "root",
})
export class RestService {
  private readonly api = environment.api_endpoint;
  private readonly r_mix_api = environment.render_mix_api;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly pcService: PcService
  ) {}

  login(data: LoginDTO): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/login", { ...data, device: "web" })
      .pipe(
        map((res) => {
          this.authService.login(res);
        }),
        catchError((error) => {
          throw new Error(error.message);
        })
      );
  }

  signup(data: SignupDTO): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/signup", { ...data, device: "web" })
      .pipe(
        map(() => {}),
        catchError((error) => {
          throw new Error(error.message);
        })
      );
  }

  updateProfile(data: UpdateProfileDTO): Observable<void> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return this.http.put(this.r_mix_api + "/accounts/profile", formData).pipe(
      map(() => {}),
      catchError((error) => {
        throw new Error(error.message);
      })
    );
  }

  updatePassword(password: string): Observable<void> {
    return this.http
      .put(this.r_mix_api + "/accounts/password", { password })
      .pipe(
        map(() => {}),
        catchError((error) => {
          throw new Error(error.message);
        })
      );
  }

  updateEmail(email: string): Observable<string> {
    return this.http.put(this.r_mix_api + "/accounts/email", { email }).pipe(
      map((res) => res["msg"]),
      catchError((error) => {
        throw new Error(error.message);
      })
    );
  }

  verify(token: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/verify_signup/" + token, null)
      .pipe(
        map((res) => {}),
        catchError((error) => {
          throw new Error(error.message);
        })
      );
  }

  requestResetPassword(email: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/request_reset_password/" + email, null)
      .pipe(
        map((res) => {}),
        catchError((error) => {
          throw new Error(error.message);
        })
      );
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/reset_password", { token, password })
      .pipe(
        map((res) => {}),
        catchError((error) => {
          throw new Error(error.message);
        })
      );
  }

  getSessions(): Observable<Session[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/accounts/sessions")
      .pipe(map((res) => res.map((d) => new Session(d))));
  }

  deleteSession(key: string): Observable<void> {
    return this.http.delete(this.r_mix_api + "/accounts/sessions/" + key).pipe(
      map(() => {}),
      catchError((error) => {
        throw new Error(error.message);
      })
    );
  }

  payForSubscription(packageName: string): Observable<PaytmTxn> {
    return this.http
      .post<PaytmTxn>(
        this.r_mix_api + "/accounts/subscription/" + packageName + "/pay",
        null
      )
      .pipe(
        map((res) => res),
        catchError((res) => {
          throw new Error(res.message);
        })
      );
  }

  getWishlist(): Observable<string[]> {
    return this.http
      .get<string[]>(this.r_mix_api + "/accounts/wishlist")
      .pipe();
  }

  addWishlist(gameId: string): Observable<any> {
    return this.http
      .post(this.r_mix_api + "/accounts/add_to_wishlist/" + gameId, null)
      .pipe();
  }

  removeWishlist(gameId: string): Observable<any> {
    return this.http
      .post(this.r_mix_api + "/accounts/remove_from_wishlist/" + gameId, null)
      .pipe();
  }

  getPcInfo(): Observable<void> {
    const formData = new FormData();
    return this.http.post(this.api + "/pc/info", formData).pipe(
      map((res) => this.pcService.getInfo(res["data"])),
      catchError((res) => {
        throw new Error(res.error["error_msg"]);
      })
    );
  }

  startPc(): Observable<StartPcRO> {
    const formData = new FormData();
    formData.append("real_time", "true");
    return this.http.post(this.api + "/pc/system/start", formData).pipe(
      map((res) => res["data"]),
      catchError((res) => {
        throw new Error(res.error["error_msg"]);
      })
    );
  }

  stopPc(): Observable<void> {
    const formData = new FormData();
    formData.append("real_time", "true");
    return this.http.post(this.api + "/pc/system/stop", formData).pipe(
      map(() => {}),
      catchError((res) => {
        throw new Error(res.error["error_msg"]);
      })
    );
  }

  startConsole(): Observable<void> {
    const formData = new FormData();
    formData.append("real_time", "true");
    return this.http.post(this.api + "/pc/console/start", formData).pipe(
      map(() => {}),
      catchError((res) => {
        throw new Error(res.error["error_msg"]);
      })
    );
  }

  stopConsole(): Observable<void> {
    const formData = new FormData();
    formData.append("real_time", "true");
    return this.http.post(this.api + "/pc/console/stop", formData).pipe(
      map(() => {}),
      catchError((res) => {
        throw new Error(res.error["error_msg"]);
      })
    );
  }

  getGameDetails(id: string): Observable<GameModel> {
    return this.http
      .get(this.r_mix_api + "/games/" + id + "/info")
      .pipe(map((res) => new GameModel(res)));
  }

  search(query: string): Observable<GameModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/games/search", {
        params: { query },
      })
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getSimilarGames(id: string): Observable<GameModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/games/" + id + "/similar")
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getGamesByGenre(genre: string): Observable<GameModel[]> {
    const data = {
      genres: genre,
      order_by: "trend_score:desc",
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data)
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getGamesByDeveloper(developer: string): Observable<GameModel[]> {
    const data = {
      developer,
      order_by: "trend_score:desc",
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data)
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getFilteredGames(query: { [key: string]: string }): Observable<GameModel[]> {
    const data = {
      ...query,
      order_by: "release_date:desc",
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data)
      .pipe(map((res) => res.map((d) => new GameModel(d))));
  }

  getWishlistGames(ids: string[]): Observable<GameModel[]> {
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

  getHomeFeed(): Observable<HomeFeeds> {
    return this.http
      .get<any[]>(this.r_mix_api + "/games/feed/personalized")
      .pipe(
        map((res) => {
          const games = res.map((d) => new GameFeedModel(d));
          return {
            games,
            categories: [],
            banners: [],
          };
        })
      );
  }

  getStreamsFeed(): Observable<VideoFeedModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/streams")
      .pipe(map((res) => res.map((d) => new VideoFeedModel(d))));
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

  getDirectMessages(friendId: string): Observable<MessageModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/friends/" + friendId + "/messages")
      .pipe(map((res) => res.map((d) => new MessageModel(d))));
  }

  getGroupMessages(groupId: string): Observable<MessageModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/social/groups/" + groupId + "/messages")
      .pipe(map((res) => res.map((d) => new MessageModel(d))));
  }

  getStreamMessages(streamId: string): Observable<MessageModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/stream/" + streamId + "/messages")
      .pipe(map((res) => res.map((d) => new MessageModel(d))));
  }

  getLocation(ip: string): Observable<string> {
    return this.http.get(this.r_mix_api + "/location/" + ip).pipe(
      map((res) => `${res["city"]}, ${res["country_name"]}`),
      catchError(() => "unknown")
    );
  }
}
