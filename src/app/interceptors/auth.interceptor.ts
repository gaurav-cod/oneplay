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
    const formData = req.body as FormData;

    if (req.urlWithParams.startsWith(environment.api_endpoint)) {
      formData.append("token", environment.api_token);
      formData.append("session-token", this.authService.sessionToken);
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
        if (error instanceof HttpErrorResponse && error.status === 403) {
          this.authService.logout();
        }
        return throwError(error);
      })
    );
  }
}
