import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  TimeoutError,
  firstValueFrom,
  from,
  fromEvent,
  lastValueFrom,
} from "rxjs";
import { catchError, filter, map, timeout } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth.service";
import Swal from "sweetalert2";
import networkImage from "./network-image";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isInternetPopupOpen = false;

  constructor(private readonly authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let req = request;

    if (req.urlWithParams.startsWith(environment.client_api)) {
      const formData: FormData = req.body || new FormData();
      const { userid, token } = this.authService.userIdAndToken;
      formData.append("user_id", userid);
      formData.append("session_token", token);
    } else if (req.urlWithParams.startsWith(environment.render_mix_api)) {
      req = req.clone({
        setHeaders: {
          session_token: this.authService.sessionToken,
        },
      });
    }

    const isRenderMixAPI = req.urlWithParams.startsWith(
      environment.render_mix_api
    );

    return next
      .handle(req)
      .pipe(timeout(30000))
      .pipe(
        filter((res) => res instanceof HttpResponse),
        map((res) => {
          if (this.isInternetPopupOpen) {
            Swal.close();
            this.isInternetPopupOpen = false;
          }
          return res;
        }),
        catchError(async (error: HttpErrorResponse) => {
          if (error.statusText !== "OK") {
            const isOnline = await this.checkNetwork();
            if (!isOnline && !this.isInternetPopupOpen) {
              this.isInternetPopupOpen = true;
              await Swal.fire({
                html: networkImage,
                confirmButtonText: "Refresh",
                allowOutsideClick: false,
                allowEscapeKey: false,
              });
              window.location.reload();
              return this.intercept(req, next);
            }
          }

          if (isRenderMixAPI && error.status === 401) {
            this.authService.logout();
          }

          const code = Number(error.error?.code) || error.status || 503;

          throw new HttpErrorResponse({
            status: error.status,
            statusText: error.statusText,
            error: {
              code,
              data: error.error.data,
              message:
                error.error?.message ||
                error.error?.msg ||
                "Server is not responding",
              timeout: error instanceof TimeoutError || code === 408,
            },
          });
        })
      );
  }

  private checkNetwork() {
    return new Promise<boolean>((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.onload = (res) => {
        if (xhr.status === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
      xhr.onerror = () => {
        resolve(false);
      };
      xhr.open(
        "GET",
        "https://networkconnectivity.googleapis.com/$discovery/rest?version=v1",
        true
      );
      xhr.send();
    });
  }
}
