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

  errorMessage: string;


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

  resetPasswordSuccessfull: boolean = false;

  reset() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.resetPassword(token, this.resetForm.value.password).subscribe(
      () => {
        this.resetPasswordSuccessfull = true;
      },
      (error) => {
        this.errorMessage = error.message;
        // this.showError(error);
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
  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
     }).then((response)=> {
      if (error.data.primary_CTA === "Request" && response.isConfirmed) {
        this.router.navigate(['/forgot-password'])
      }
     })
  }
}
