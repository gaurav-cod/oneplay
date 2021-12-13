import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, catchError } from "rxjs";
import { environment } from "src/environments/environment";
import { HomeFeeds, LoginDTO, SignupDTO, StartPcRO } from "../interface";
import { GameModel } from "../models/game.model";
import { GameFeedModel } from "../models/gameFeed.model";
import { PC } from "../models/pc.model";
import { UserModel } from "../models/user.model";
import { VideoModel } from "../models/video.model";
import { AuthService } from "./auth.service";
import { PcService } from "./pc.service";

@Injectable({
  providedIn: "root",
})
export class RestService {
  private readonly api = environment.api_endpoint;
  private readonly idam_api = environment.idam_api_endpoint;
  private readonly r_mix_api = environment.render_mix_api;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly pcService: PcService
  ) {}

  login(data: LoginDTO): Observable<void> {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    return this.http.post(this.idam_api + "/user/login", formData).pipe(
      map((res) => {
        this.authService.login(res["data"]);
      }),
      catchError((res) => {
        throw new Error(res.error["error_msg"]);
      })
    );
  }

  signup(data: SignupDTO): Observable<void> {
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("gender", data.gender);
    return this.http.post(this.idam_api + "/user/signup", formData).pipe(
      map(() => {}),
      catchError((res) => {
        if (res.error["is_error"]) throw new Error(res.error["error_msg"]);
        throw res.error["data"]["msg"];
      })
    );
  }

  verify(token: string): Observable<void> {
    const formData = new FormData();
    formData.append("verification_token", token);
    return this.http.post(this.idam_api + "/user/verify_signup", formData).pipe(
      map((res) => {}),
      catchError((res) => {
        throw new Error(res.error["error_msg"]);
      })
    );
  }

  requestResetPassword(email: string): Observable<void> {
    const formData = new FormData();
    formData.append("email", email);
    return this.http
      .post(this.idam_api + "/user/request_password_reset", formData)
      .pipe(
        map((res) => {}),
        catchError((res) => {
          throw new Error(res.error["error_msg"]);
        })
      );
  }

  resetPassword(token: string, password: string): Observable<void> {
    const formData = new FormData();
    formData.append("reset_token", token);
    formData.append("password", password);
    return this.http
      .post(this.idam_api + "/user/reset_password", formData)
      .pipe(
        map((res) => {}),
        catchError((res) => {
          throw new Error(res.error["error_msg"]);
        })
      );
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
      .post(this.r_mix_api + "/games/" + id + "/info", null)
      .pipe(map((res) => new GameModel(res["data"])));
  }

  search(q: string): Observable<GameModel[]> {
    return this.http
      .post(this.r_mix_api + "/search?q=" + q, null)
      .pipe(
        map((res) =>
          !!res["data"] ? res["data"].map((d: any) => new GameModel(d)) : []
        )
      );
  }

  getSimilarGames(id: string): Observable<GameModel[]> {
    return this.http
      .post(this.r_mix_api + "/games/" + id + "/similar", null)
      .pipe(
        map((res) =>
          res["data"].map((d: any) => new GameModel(d))
        )
      );
  }

  getGamesByGenre(genre: string): Observable<GameModel[]> {
    const data = [
      {
        genres: genre,
        order_by: "trend_score:desc",
      },
    ];
    return this.http
      .post(this.r_mix_api + "/feed/custom", data)
      .pipe(map((res) => res["data"].map((d: any) => new GameModel(d))));
  }

  getGamesByDeveloper(developer: string): Observable<GameModel[]> {
    const data = [
      {
        developer,
        order_by: "trend_score:desc",
      },
    ];
    return this.http
      .post(this.r_mix_api + "/feed/custom", data)
      .pipe(map((res) => res["data"].map((d: any) => new GameModel(d))));
  }

  getFilteredGames(): Observable<GameModel[]> {
    const data = [
      {
        order_by: "release_date:desc",
      },
    ];
    return this.http
      .post(this.r_mix_api + "/feed/custom", data)
      .pipe(map((res) => res["data"].map((d: any) => new GameModel(d))));
  }

  getAllGames(page: number): Observable<GameModel[]> {
    return this.http
      .post(this.r_mix_api + "/games?page=" + page, null)
      .pipe(map((res) => res["data"].map((d: any) => new GameModel(d))));
  }

  getHomeFeed(): Observable<HomeFeeds> {
    return this.http.post(this.r_mix_api + "/feed/personalized", null).pipe(
      map((res) => {
        const games = res["data"].map((d: any) => new GameFeedModel(d));
        return {
          games,
          categories: [],
          banners: [],
        };
      })
    );
  }

  getVideos(id: string): Observable<VideoModel[]> {
    return this.http
      .post(this.r_mix_api + "/streams/youtube?game_id=" + id, null)
      .pipe(map((res) => res["data"].map((d: any) => new VideoModel(d))));
  }

  getLiveVideos(id: string): Observable<VideoModel[]> {
    const data = [
      {
        order_by: "release_date:desc",
      },
    ];
    return this.http
      .post(
        this.r_mix_api + "/streams/youtube?game_id=" + id + "&eventType=live",
        data
      )
      .pipe(map((res) => res["data"].map((d: any) => new VideoModel(d))));
  }
}
