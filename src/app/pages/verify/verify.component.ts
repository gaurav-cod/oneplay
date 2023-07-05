import { Component, OnInit, AfterViewInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.scss"],
})
export class VerifyComponent implements OnInit {
  otp = new UntypedFormControl("", Validators.required);
  otpSent = localStorage.getItem('otpSent') === 'true';
  sendingOTP = false;
  display: any;
  remainingTimer = false;

  constructor(
    private readonly authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly title: Title,
    
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Verify Account");
  }

  timer(minute) {
    // let minute = 1;
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;

      this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
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
        localStorage.setItem('otpSent', 'true');
      },
      (err) => {
        this.sendingOTP = false;
        if(err.message == "Wait for 60 seconds before you can request new secret code.") {
          this.timer(1);
        } else {
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
        localStorage.removeItem('otpSent');
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
      error: (error) => {
        if(error.message == "Invalid OTP") {
          Swal.fire({
            title: "Error Code: " + error.code,
            text: error.message,
            icon: "error",
          })
        } else {
          this.resendVerificationLink(error, token);
        }
        
      },
    });
  }

  private resendVerificationLink(error: any, token: string) {
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
            this.restService.resendVerificationLink(email, password).subscribe({
              next: () => {
                localStorage.removeItem('otpSent');
                Swal.fire({
                  icon: "success",
                  title: "Check your email and verify again",
                }).then(() => this.router.navigateByUrl("/login"));
              },
              error: (error) => this.resendVerificationLink(error, token),
            });
          }
        });
      } else {
        window.location.href = `${this.domain}/contact.html`
      }
    });
  }

  get domain() {
    return environment.domain;
  }
}
