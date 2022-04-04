import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService
  ) {}

  ngOnInit(): void {}

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
      },
      (err) => {
        Swal.fire({
          title: "Opps...",
          text: "Error sending OTP",
          icon: "error",
          confirmButtonText: "OK",
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
          confirmButtonText: "OK",
        })
    );
  }
}
