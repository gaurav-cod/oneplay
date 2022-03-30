import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { RestService } from "src/app/services/rest.service";

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
    private restService: RestService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  getOTP() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.sendOTP(token).subscribe(
      () => {
        this.toastr.success("OTP sent successfully");
      },
      (err) => {
        this.toastr.error(err);
      }
    );
  }

  verify() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.verify({ token, otp: this.otp.value }).subscribe(
      () => {
        this.toastr.success(
          "Your account has been verified. You can now login.",
          "Verification Success"
        );
        this.router.navigateByUrl("/login");
      },
      (error) => this.toastr.error(error)
    );
  }
}
