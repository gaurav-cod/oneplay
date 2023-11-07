import { Component, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-reset-pass",
  templateUrl: "./reset-pass.component.html",
  styleUrls: ["./reset-pass.component.scss"],
})
export class ResetPassComponent implements OnInit {

  resetForm = new UntypedFormGroup({
    password: new UntypedFormControl("", [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)]),
    confirmPassword: new UntypedFormControl("", [Validators.required]),
  });

  get checkvalidationValue() {
    if (this.resetForm.value.password.length && this.resetForm.value.password === this.resetForm.value.confirmPassword) {
      return false;
    } else {
      return true;
    }
  }

  get passwordErrored() {
    const control = this.resetForm.controls["password"];
    return control.touched && control.invalid;
  }

  get confirmPasswordErrored() {
    const control = this.resetForm.controls["confirmPassword"];
    if (this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      return control.touched && true;
    } else {
      return control.touched && false;
    }

  }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly title: Title,
    private readonly countlyService: CountlyService,
  ) { }

  ngOnInit(): void {
    this.title.setTitle("Reset Password");
  }

  showPassword = false;
  showConfirmPassword = false;

  reset() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.resetPassword(token, this.resetForm.value.password).subscribe(
      () => {
        this.router.navigate(['/success']);
        // Swal.fire({
        //   title: "Success",
        //   text: "Password reset successfully",
        //   icon: "success",
        //   confirmButtonText: "OK",
        // }).then(() => this.goToLogin());
      },
      (error) => {
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
          confirmButtonText: "Try Again",
        })
      }
    );
  }

  goToLogin() {
    // this.countlyService.addEvent("signINButtonClick", {
    //   page: location.pathname + location.hash,
    //   trigger: "CTA",
    //   channel: "web",
    // });
    this.router.navigate(["/login"]);
  }

  get domain() {
    return environment.domain;
  }
}
