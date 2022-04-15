import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError, filter } from "rxjs/operators";
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

    return next.handle(req).pipe(
      filter((res) => res instanceof HttpResponse),
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (req.urlWithParams.startsWith(environment.render_mix_api)) {
            this.authService.logout();
          }
        }
        return throwError(error);
      })
    );
  }
}
