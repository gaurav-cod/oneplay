import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { mapSignUpAccountVerificationFailureReasons } from "src/app/utils/countly.util";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.scss"],
})
export class VerifyComponent implements OnInit, OnDestroy {
  otp = new UntypedFormControl("", [
    Validators.required,
    Validators.maxLength(6),
    Validators.pattern("^[0-9]*$"),
  ]);
  otpSent = localStorage.getItem("otpSent") === "true";
  sendingOTP = false;
  display: any;
  remainingTimer = false;

  constructor(
    private readonly authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly title: Title,
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Verify Account");
    this.countlyService.startEvent("signUpAccountVerification");
  }

  ngOnDestroy(): void {
    this.countlyService.cancelEvent("signUpAccountVerification");
  }

  timer(minute) {
    let seconds: any = 60;
    const timer = setInterval(() => {
      seconds--;
      const prefix = seconds < 10 ? "0" : "";
      this.display = `${prefix}${seconds}`;
      this.remainingTimer = true;
      if (seconds == 0) {
        this.remainingTimer = false;
        clearInterval(timer);
      }
    }, 1000);
  }

  getOTP() {
    const token = this.route.snapshot.paramMap.get("token");
    this.sendingOTP = true;
    this.restService.sendOTP(token).subscribe(
      () => {
        this.sendingOTP = false;
        Swal.fire({
          title: "Success",
          text: "OTP sent successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        this.otpSent = true;
        this.timer(1);
        localStorage.setItem("otpSent", "true");
      },
      (err) => {
        this.sendingOTP = false;
        this.countlyService.endEvent("signUpAccountVerification", {
          result: "failure",
          failureReason: mapSignUpAccountVerificationFailureReasons(
            err.message
          ),
        });
        if (err.message == "Token Expired" || err.message == "Invalid Token") {
          this.resendVerificationLink(err, token);
        } else {
          if (err.isOnline)
            Swal.fire({
              title: "Error Code: " + err.code,
              text: err.message,
              icon: "error",
              confirmButtonText: "OK",
            });
        }
      }
    );
  }

  verify() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.verify({ token, otp: this.otp.value }).subscribe({
      next: (token) => {
        localStorage.removeItem("otpSent");
        this.countlyService.endEvent("signUpAccountVerification", {
          result: "success",
        });
        Swal.fire({
          title: "Verification Success",
          text: "Your account has been verified.",
          icon: "success",
          confirmButtonText: "OK",
          allowEscapeKey: false,
        }).then(() => {
          this.authService.login(token);
        });
      },
      error: async (error) => {
        this.countlyService.endEvent("signUpAccountVerification", {
          result: "failure",
          failureReason: mapSignUpAccountVerificationFailureReasons(
            error.message
          ),
        });
        // wait for countly to send network request.
        await new Promise(r => setTimeout(() => r, 500));
        if (error.message == "Invalid OTP") {
          if (error.isOnline)
            Swal.fire({
              title: "Error Code: " + error.code,
              text: error.message,
              icon: "error",
            });
        } else {
          this.resendVerificationLink(error, token);
        }
      },
    });
  }

  private resendVerificationLink(error: any, token: string) {
    if (error.isOnline)
      Swal.fire({
        title: "Error Code: " + error.code,
        text: error.message,
        icon: "error",
        confirmButtonText: "Resend Verification Link",
        cancelButtonText: "Report Issue",
        showCancelButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((res) => {
        if (res.isConfirmed) {
          Swal.fire({
            title: "Enter your password",
            input: "password",
            inputAttributes: {
              autocapitalize: "off",
            },
            confirmButtonText: "Proceed",
            showLoaderOnConfirm: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then((result) => {
            if (result.isConfirmed) {
              const password = result.value;
              const [encodedEmail] = atob(token).split(":");
              const email = atob(encodedEmail);
              Swal.showLoading();
              this.restService
                .resendVerificationLink(email, password)
                .subscribe({
                  next: () => {
                    localStorage.removeItem("otpSent");
                    Swal.fire({
                      icon: "success",
                      title: "Check your email and verify again",
                    }).then(() => this.goToLogin());
                  },
                  error: (error) => this.resendVerificationLink(error, token),
                });
            }
          });
        } else {
          window.location.href = `${this.domain}/contact.html`;
        }
      });
  }

  get domain() {
    return environment.domain;
  }

  private goToLogin() {
    this.router.navigate(["/login"]);
  }
}
