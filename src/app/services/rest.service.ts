import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError } from "rxjs";
import { environment } from "src/environments/environment";
import {
  HomeFeeds,
  LoginDTO,
  PaytmTxn,
  SignupDTO,
  StartGameRO,
  UpdateProfileDTO,
} from "../interface";
import { FriendModel } from "../models/friend.model";
import { GameModel } from "../models/game.model";
import { GameFeedModel } from "../models/gameFeed.model";
import { MessageModel } from "../models/message.model";
import { Session } from "../models/session.model";
import { VideoFeedModel } from "../models/streamFeed.model";
import { SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { VideoModel } from "../models/video.model";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class RestService {
  private readonly client_api = environment.client_api;
  private readonly r_mix_api = environment.render_mix_api;

  constructor(private readonly http: HttpClient) {}

  login(data: LoginDTO): Observable<string> {
    return this.http
      .post(this.r_mix_api + "/accounts/login", { ...data, device: "web" })
      .pipe(
        map((res) => res["session_token"]),
        catchError(({ error }) => {
          throw new Error(error.message);
        })
      );
  }

  signup(data: SignupDTO): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/signup", { ...data, device: "web" })
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw new Error(error.message);
        })
      );
  }

  getName(id: string): Observable<string> {
    return this.http
      .get<string>(this.r_mix_api + "/accounts/" + id + "/name")
      .pipe(
        map((res) => res),
        catchError(({ error }) => {
          throw new Error(error.message);
        })
      );
  }

  getProfile(): Observable<UserModel> {
    return this.http.get(this.r_mix_api + "/accounts/profile").pipe(
      map((res) => new UserModel(res)),
      catchError(({ error }) => {
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
      catchError(({ error }) => {
        throw new Error(error.message);
      })
    );
  }

  updatePassword(password: string): Observable<void> {
    return this.http
      .put(this.r_mix_api + "/accounts/password", { password })
      .pipe(
        map(() => {}),
        catchError(({ error }) => {
          throw new Error(error.message);
        })
      );
  }

  updateEmail(email: string): Observable<string> {
    return this.http.put(this.r_mix_api + "/accounts/email", { email }).pipe(
      map((res) => res["msg"]),
      catchError(({ error }) => {
        throw new Error(error.message);
      })
    );
  }

  verify(token: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/verify_signup/" + token, null)
      .pipe(
        map((res) => {}),
        catchError(({ error }) => {
          throw new Error(error.message);
        })
      );
  }

  requestResetPassword(email: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/request_reset_password/" + email, null)
      .pipe(
        map((res) => {}),
        catchError(({ error }) => {
          throw new Error(error.message);
        })
      );
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http
      .post(this.r_mix_api + "/accounts/reset_password", { token, password })
      .pipe(
        map((res) => {}),
        catchError(({ error }) => {
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
      catchError(({ error }) => {
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
        catchError(({ error }) => {
          throw new Error(error.message);
        })
      );
  }

  getSubscriptions(): Observable<SubscriptionModel[]> {
    return this.http
      .get<any[]>(this.r_mix_api + "/accounts/subscription/all")
      .pipe(map((res) => res.map((d) => new SubscriptionModel(d))));
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

  getFilteredGames(
    query: { [key: string]: string },
    page: number
  ): Observable<GameModel[]> {
    const data = {
      ...query,
      order_by: "release_date:desc",
    };
    return this.http
      .post<any[]>(this.r_mix_api + "/games/feed/custom", data, {
        params: { page, limit: 12 },
      })
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
      .get<any[]>(this.r_mix_api + "/games/feed/personalized", {
        params: {
          textBackground: "280x170",
          textLogo: "400x320",
        },
      })
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

  startGame(
    gameId: string,
    resolution: string,
    is_vsync_enabled: boolean,
    fps: number,
    bitrate: number
  ): Observable<StartGameRO> {
    const formData = new FormData();
    formData.append("game_id", gameId);
    formData.append(
      "launch_payload",
      JSON.stringify({ resolution, is_vsync_enabled, fps, bitrate })
    );
    return this.http
      .post<StartGameRO>(this.client_api + "/start_game", formData)
      .pipe(
        map((res) => res["data"]),
        catchError((err) => {
          throw new Error(err.error.msg);
        })
      );
  }

  getClientToken(sessionId: string): Observable<string> {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    return this.http
      .post<string>(this.client_api + "/get_session", formData)
      .pipe(
        map((res) => res["data"]["client_token"]),
        catchError((err) => {
          throw new Error(err.error.msg);
        })
      );
  }

  terminateGame(sessionId: string): Observable<void> {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    return this.http
      .post<void>(this.client_api + "/terminate_stream", formData)
      .pipe(
        map(() => {}),
        catchError((err) => {
          throw new Error(err.error.msg);
        })
      );
  }
}
