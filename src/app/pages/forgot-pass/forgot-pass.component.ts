import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-forgot-pass",
  templateUrl: "./forgot-pass.component.html",
  styleUrls: ["./forgot-pass.component.scss"],
})
export class ForgotPassComponent implements OnInit {
  email = new FormControl("", Validators.required);
  resetemail = false;

  constructor(
    private readonly restService: RestService,
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Forgot Password");
  }

  submit() {
    this.restService.requestResetPassword(this.email.value).subscribe(
      () =>
        {
          this.resetemail = true;
        },
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
