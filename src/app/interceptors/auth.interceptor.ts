import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subscription, TimeoutError, fromEvent } from "rxjs";
import { catchError, filter, timeout } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth.service";
import Swal from "sweetalert2";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  networkListener: Subscription = undefined;
  constructor(private readonly authService: AuthService) {}

  checkNetwork() {
    if (window.navigator.onLine) {
      this.networkListener?.unsubscribe();
      this.networkListener = undefined;
    } else {
      if (this.networkListener === undefined) {
        Swal.fire({
          html: '<svg width="94" class="mt-4" height="80" viewBox="0 0 94 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M53.7955 4.983C53.805 7.7444 51.574 9.9906 48.8125 9.99995C41.299 10.0255 33.8685 11.5929 26.9815 14.6014C20.0954 17.6095 13.8988 21.9968 8.77397 27.4925C6.89067 29.5121 3.72677 29.6225 1.70722 27.7392C-0.312379 25.8559 -0.422829 22.6921 1.46042 20.6725C7.51702 14.1776 14.8403 8.99265 22.9784 5.43765C31.1155 1.88305 39.897 0.0302497 48.7785 4.97326e-05C51.54 -0.00935027 53.786 2.2216 53.7955 4.983ZM65.4635 1.46445C67.416 -0.48815 70.582 -0.48815 72.5345 1.46445L78.999 7.92885L85.4635 1.46445C87.416 -0.48815 90.582 -0.48815 92.5345 1.46445C94.487 3.4171 94.487 6.5829 92.5345 8.53555L86.07 14.9999L92.5345 21.4643C94.487 23.4169 94.487 26.5828 92.5345 28.5354C90.582 30.488 87.416 30.488 85.4635 28.5354L78.999 22.071L72.5345 28.5354C70.582 30.488 67.416 30.488 65.4635 28.5354C63.511 26.5828 63.511 23.4169 65.4635 21.4643L71.928 14.9999L65.4635 8.53555C63.511 6.5829 63.511 3.4171 65.4635 1.46445ZM53.79 24.9736C53.805 27.735 51.578 29.9854 48.8165 30C44.046 30.025 39.3295 31.0255 34.9594 32.9395C30.5893 34.8535 26.6566 37.6405 23.4029 41.1295C21.5196 43.149 18.3557 43.2595 16.3361 41.3765C14.3165 39.493 14.2061 36.329 16.0893 34.3095C20.2727 29.8236 25.329 26.2401 30.9478 23.7794C36.5666 21.3186 42.63 20.0324 48.764 20C51.5255 19.9855 53.7755 22.2122 53.79 24.9736ZM56.8775 51.6175C54.366 50.541 51.661 49.9905 48.9295 50C46.196 50.0095 43.492 50.5785 40.9895 51.6715C38.4861 52.7655 36.233 54.3605 34.3697 56.359C32.4864 58.3785 29.3225 58.489 27.3029 56.6055C25.2833 54.7225 25.1729 51.5585 27.0561 49.539C29.8512 46.5415 33.2307 44.149 36.9863 42.508C40.743 40.8665 44.7975 40.0145 48.8945 40C52.993 39.9855 57.0505 40.8115 60.817 42.426C64.583 44.04 67.9805 46.4085 70.797 49.387C72.6945 51.3935 72.606 54.558 70.5995 56.4555C68.593 58.353 65.4285 58.2645 63.5315 56.258C61.6545 54.2735 59.39 52.694 56.8775 51.6175ZM38.999 70C38.999 64.477 43.476 60 48.999 60C54.522 60 58.999 64.477 58.999 70C58.999 75.523 54.522 80 48.999 80C43.476 80 38.999 75.523 38.999 70Z" fill="url(#paint0_linear_2960_2940)"/><defs><linearGradient id="paint0_linear_2960_2940" x1="92.4307" y1="61.4699" x2="8.20366" y2="3.70934" gradientUnits="userSpaceOnUse"><stop stop-color="#0575E6"/><stop offset="1" stop-color="#FF0CF5"/></linearGradient></defs></svg><p class="swal2-title mt-4">NO INTERNET CONNECTION</p> <p class="swal2-html-container p-0 mx-0">you are not connected to internet. Please connect to the internet any try again.</p>',
          customClass: "wifi_img",
          confirmButtonText: "Refresh",
          showCloseButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        this.networkListener = fromEvent(window, 'online')
        .subscribe(_ => {
          this.networkListener?.unsubscribe();
          Swal.close();
        })
      }
    }
  }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let req = request;
    this.checkNetwork()

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
        catchError((error: HttpErrorResponse) => {
          if (isRenderMixAPI && error.status === 401) {
            this.authService.logout();
          }

          const code = Number(error.error?.code) || error.status || 503;

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
        })
      );
  }
}
