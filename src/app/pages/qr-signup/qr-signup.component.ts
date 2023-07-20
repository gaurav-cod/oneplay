import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-qr-signup",
  templateUrl: "./qr-signup.component.html",
  styleUrls: ["./qr-signup.component.scss"],
})
export class QrSignupComponent implements OnInit {
  public signInQrCode: string = "";
  public code: string = "";

  private generateCodeSubscription: Subscription;
  private getSessionSubscription: Subscription;
  private mounted: boolean;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly loaderService: NgxUiLoaderService,
    private readonly countlyService: CountlyService,
    private readonly router: Router,
  ) {}

  ngOnDestroy(): void {
    this.mounted = false;
    this.generateCodeSubscription?.unsubscribe();
    this.getSessionSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.mounted = true;
    this.generateCode();
  }

  tvURL = environment.domain + "/dashboard/tv";

  get qrCodeWidth() {
    if (window.innerWidth > 986) {
      return 200;
    } else if (window.innerWidth < 985) {
      return 130;
    }
  }

  private generateCode() {
    if (!this.mounted) {
      return;
    }
    this.loaderService.start();
    this.generateCodeSubscription?.unsubscribe();
    this.generateCodeSubscription = this.restService
      .generateQRCode()
      .subscribe({
        next: ({ code, token }) => {
          this.loaderService.stop();
          this.signInQrCode = this.tvURL + "?code=" + code;
          this.code = code;
          this.loginWithSession(code, token);
        },
        error: (err) => {
          this.loaderService.stop();
          Swal.fire({
            title: "Error Code: " + err.error.code,
            text: err.error.message,
            icon: "error",
            confirmButtonText: "Reload",
          }).then((result) => {
            if (result.isConfirmed) {
              this.generateCode();
            }
          });
        },
      });
  }

  private loginWithSession(code: string, token: string) {
    if (!this.mounted) {
      return;
    }
    const startTime = Date.now();
    this.getSessionSubscription?.unsubscribe();
    this.getSessionSubscription = this.restService
      .getQRSession(code, token)
      .subscribe({
        next: ({ sessionToken }) => {
          if (!sessionToken) {
            const timeTaken = Date.now() - startTime;
            if (timeTaken >= 2000) {
              this.loginWithSession(code, token);
            } else {
              setTimeout(() => this.loginWithSession(code, token), 1000);
            }
          } else {
            // this.countlyService.add_event({ key: 'login', segmentation: {
            //   event_category: "user",
            //   event_label: "tv",
            // }});
            this.authService.login(sessionToken);
          }
        },
        error: (err) => {
          Swal.fire({
            title: "Error Code: " + err.code,
            text: "Timeout!",
            icon: "error",
            confirmButtonText: "Reload",
          }).then((result) => {
            if (result.isConfirmed) {
              this.generateCode();
            }
          });
        },
      });
  }

  goToLogin() {
    this.countlyService.addEvent("signINButtonClick", {
      page: location.pathname + location.hash,
      trigger: "CTA",
    });
    this.router.navigate(["/login"]);
  }
}
