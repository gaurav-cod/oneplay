import { Component, OnInit, AfterViewInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
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
export class VerifyComponent implements OnInit, AfterViewInit {
  otp = new FormControl("", Validators.required);
  otpSent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService
  ) {}

  ngAfterViewInit(): void {
    this.verify();
  }

  ngOnInit(): void {
    this.title.setTitle("Verify Account");
  }

  getOTP() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.sendOTP(token).subscribe(
      () => {
        Swal.fire({
          title: "Success",
          text: "OTP sent successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        this.otpSent = true;
      },
      (err) => {
        Swal.fire({
          title: "Error Code: " + err.code,
          text: err.message,
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    );
  }

  verify() {
    this.loaderService.startLoader("verify");
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.verify({ token, otp: this.otp.value }).subscribe({
      next: () => {
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
      error: (error) =>
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
          confirmButtonText: "Try Again",
          allowEscapeKey: false,
        }).then((res) => {
          if (res.isConfirmed) {
            this.verify();
          } else {
            this.router.navigateByUrl("/login");
          }
        }),
      complete: () => {
        this.loaderService.stopLoader("verify");
      },
    });
  }
}
