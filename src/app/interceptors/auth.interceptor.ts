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
        environment.production ? token : "d1a06caf-7153-4bee-8b7c-e52e47b68b37"
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
      catchError((error: HttpErrorResponse) => {
        if (req.urlWithParams.startsWith(environment.render_mix_api) && error.status === 401) {
          this.authService.logout();
        }
        console.log(error.error)
        throw new HttpErrorResponse({
          status: error.status,
          statusText: error.statusText,
          error: {
            code: error.status,
            message: error.error?.message || error.error?.msg || error.message || "Server is not responding",
          }
        })
      })
    );
  }
}
