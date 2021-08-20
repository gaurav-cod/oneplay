import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private readonly authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const formData = (req.body as FormData);

        formData.append("token", environment.api_token);
        formData.append("device", "web");

        if (req.urlWithParams.startsWith(environment.idam_api_endpoint)) {
            formData.append("session-token", "AUTH");
        } else if (req.urlWithParams.startsWith(environment.api_endpoint)) {
            formData.append("session-token", this.authService.sessionToken);
        }

        return next.handle(req);
    }
}