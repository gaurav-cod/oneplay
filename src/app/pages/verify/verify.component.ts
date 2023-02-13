import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.scss"],
})
export class VerifyComponent implements OnInit {
  otp = new FormControl("", Validators.required);
  otpSent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly title: Title,
  ) {}

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
          title: "Opps...",
          text: err,
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    );
  }

  verify() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.verify({ token, otp: this.otp.value }).subscribe(
      () => {
        Swal.fire({
          title: "Verification Success",
          text: "Your account has been verified. You can now login.",
          icon: "success",
          confirmButtonText: "OK",
        });
        this.router.navigateByUrl("/login");
      },
      (error) =>
        Swal.fire({
          title: "Opps...",
          text: error,
          icon: "error",
          confirmButtonText: "Try Again",
        })
    );
  }
}
