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
import { catchError, filter, timeout } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth.service";
import Swal from "sweetalert2";
import networkImage from "./network-image";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isOnline: boolean = true;

  constructor(private readonly authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let req = request;

    this.checkNetwork();

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
        catchError((error: HttpErrorResponse, res) => {
          if (isRenderMixAPI && error.status === 401) {
            this.authService.logout();
          }

          const code = Number(error.error?.code) || error.status || 503;

          if (this.isOnline) {
            throw new HttpErrorResponse({
              status: error.status,
              statusText: error.statusText,
              error: {
                code,
                message:
                  error.error?.message ||
                  error.error?.msg ||
                  "Server is not responding",
                timeout: error instanceof TimeoutError || code === 408,
              },
            });
          } else {
            return res;
          }
        })
      );
  }

  private checkNetwork() {
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (!this.isOnline) {
        this.isOnline = true;
        Swal.close();
      }
    };
    xhr.onerror = () => {
      if (this.isOnline) {
        this.isOnline = false;
        Swal.fire({
          html: networkImage,
          confirmButtonText: "Refresh",
          showCloseButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          } else {
            this.isOnline = true;
          }
        });
      }
    };
    xhr.open("GET", "https://ifconfig.me", true);
    xhr.send();
  }
}
