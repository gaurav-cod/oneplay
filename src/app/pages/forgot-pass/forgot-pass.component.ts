import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-forgot-pass",
  templateUrl: "./forgot-pass.component.html",
  styleUrls: ["./forgot-pass.component.scss"],
})
export class ForgotPassComponent implements OnInit {
  email = new FormControl("", Validators.required);

  constructor(private readonly restService: RestService) {}

  ngOnInit(): void {}

  submit() {
    this.restService.requestResetPassword(this.email.value).subscribe(
      () =>
        Swal.fire({
          title: "Success",
          text: "Check your email to reset password",
          icon: "success",
          confirmButtonText: "OK",
        }),
      (error) =>
        Swal.fire({
          title: "Error",
          text: error,
          icon: "error",
          confirmButtonText: "OK",
        })
    );
  }
}
