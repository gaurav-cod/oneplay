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
      formData.append(
        "user_id",
        environment.production ? userid : "5e334db4-45ce-4bfa-93f0-3e7071fb0d2f"
      );
      formData.append(
        "session_token",
        environment.production ? token : "5dd09e35-14a0-4885-ba98-642ce6b45755"
      );
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
        } else if (error instanceof HttpErrorResponse && error.status === 504) {
            return throwError(new Error("Server is not responding"));
        }
      })
    );
  }
}
