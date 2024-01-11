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
            err?.message
          ),
        });
        if (
          [
            "the verification link is invalid. please request a new one.", 
            "sorry, the otp is invalid. please try again.",
            "sorry, it looks like your verification link has expired. please request a new one."
          ].includes(err?.message?.toLowerCase())) {
          this.resendVerificationLink(err, token);
        } else { 
          this.showError(err);
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

        if (error.message == "Sorry, the OTP is invalid. Please try again.") {
            this.showError(error);
        } else {
          this.resendVerificationLink(error, token);
        }
      },
    });
  }

  private resendVerificationLink(error: any, token: string) {
   
      if (["the username and password do not match. please try again."].includes(error.data.message?.toLowerCase())) {
        Swal.fire({
          title: error.data.title,
          text: error.data.message,
          imageUrl: error.data.icon,
          confirmButtonText: error.data.primary_CTA,
          showCancelButton: error.data.showSecondaryCTA,
          cancelButtonText: error.data.secondary_CTA
        })
        return;
      }
      const isReportIssueCTA = [
        "the verification link is invalid. please request a new one.", 
        "sorry, it looks like your verification link has expired. please request a new one."
      ].includes(error.data.message?.toLowerCase());

      Swal.fire({
        title: error.data.title,
        text: error.data.message,
        imageUrl: error.data.icon,
        confirmButtonText: "Request",
        cancelButtonText: isReportIssueCTA ? "Okay" : "Report Issue",
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
          if (!isReportIssueCTA) { 
            window.location.href = `${this.domain}/contact.html`;
          }
        }
      });
  }

  get domain() {
    return environment.domain;
  }

  private goToLogin() {
    this.router.navigate(["/login"]);
  }

  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    }).then((response)=> {
      if (response.isConfirmed) {
        if ( error.data.primary_CTA.toLowerCase().replace(" ","") === "sigup")
          this.router.navigate(['/register']);
      } 
    })
  }
}
