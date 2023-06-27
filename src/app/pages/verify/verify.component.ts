import { Component, OnInit, AfterViewInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { RestService } from "src/app/services/rest.service";
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Verify Account");
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
        Swal.fire({
          title: "Error Code: " + err.code,
          text: err.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    );
  }

  verify() {
    this.loaderService.startLoader("verify");
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.verify({ token, otp: this.otp.value }).subscribe({
      next: () => {
        localStorage.removeItem('otpSent');
        this.loaderService.stopLoader("verify");
        Swal.fire({
          title: "Verification Success",
          text: "Your account has been verified. You can now login.",
          icon: "success",
          confirmButtonText: "OK",
          allowEscapeKey: false,
        }).then(() => {
          this.router.navigateByUrl("/login");
        });
      },
      error: (error) => {
        this.loaderService.stopLoader("verify");
        this.resendVerificationLink(error, token);
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
        location.href = "/contact.html";
      }
    });
  }
}
