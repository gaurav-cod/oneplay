import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TimeoutError } from "rxjs";
import { catchError, filter, timeout } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
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

    return next.handle(req).pipe(timeout(10000)).pipe(
      filter((res) => res instanceof HttpResponse),
      catchError((error: HttpErrorResponse) => {
        if (
          req.urlWithParams.startsWith(environment.render_mix_api) &&
          error.status === 401
        ) {
          this.authService.logout();
        }
        // if(error instanceof TimeoutError) {
        //   console.log(error,'server-error');
        // }
        
        throw new HttpErrorResponse({
          status: error.status,
          statusText: error.statusText,
          error: {
            code: error.status || 503,
            message:
              error.error?.message ||
              error.error?.msg ||
              "Server is not responding",
            timeout: error instanceof TimeoutError
          },
        });
      })
    );
  }
}
