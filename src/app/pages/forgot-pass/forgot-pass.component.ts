import { Component, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { phoneValidator } from "src/app/utils/validators.util";
import { contryCodeCurrencyMapping } from "src/app/variables/country-code";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-forgot-pass",
  templateUrl: "./forgot-pass.component.html",
  styleUrls: ["./forgot-pass.component.scss"],
})
export class ForgotPassComponent implements OnInit {

  private countryCodeSub: Subscription;
  private emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";

  forgotPasswordForm = new UntypedFormGroup({
    email: new UntypedFormControl("", [Validators.email, Validators.pattern(this.emailPattern)]),
    country_code: new UntypedFormControl("+91", []),
    phone: new UntypedFormControl("", [phoneValidator("country_code")])
  });

  resetemail = false;

  get countryCodes() {
    return Object.values(contryCodeCurrencyMapping);
  }
  get phoneErrored() {
    const control = this.forgotPasswordForm.controls['phone'];
    return control.touched && control.invalid && control.value;
  }
  get emailErrored() {
    const control = this.forgotPasswordForm.controls["email"];
    return control.touched && control.invalid;
  }
  get checkvalidationValue() {
    return (this.forgotPasswordForm.controls['email'].value ? this.forgotPasswordForm.controls['email'].invalid : false) ||
      (this.forgotPasswordForm.controls['phone'].value ? this.forgotPasswordForm.controls['phone'].invalid : false) ||
      (!this.forgotPasswordForm.controls['email'].value && !this.forgotPasswordForm.controls['phone'].value);
  }
  get domain() {
    return environment.domain;
  }

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly router: Router,
    private readonly countlyService: CountlyService,
  ) { }

  ngOnInit(): void {
    this.title.setTitle("Forgot Password");
    this.countryCodeSub = this.forgotPasswordForm.controls['country_code'].valueChanges.subscribe(() =>
      this.forgotPasswordForm.controls['phone'].updateValueAndValidity()
    );
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (contryCodeCurrencyMapping[res.currency]) {
          this.forgotPasswordForm.controls['country_code'].setValue(
            contryCodeCurrencyMapping[res.currency]
          );
        }
      },
    });
  }

  forgotPasswordWithEmail() {
    this.restService.requestResetPassword(this.forgotPasswordForm.controls['email'].value).subscribe(
      () => {
        this.resetemail = true;

      },
      (error) =>
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
          confirmButtonText: "Try Again",
        })
    );
  }
  forgotPasswordWithMobile() {
    const phone = this.forgotPasswordForm.controls['country_code'].value + this.forgotPasswordForm.controls['phone'].value;
    this.restService.requestResetPasswordWithMobile(phone).subscribe({
      next: () => {
        this.router.navigate(['/otp-verify'], { queryParams: { mobile: phone } });
      }, error: (error) => {
        Swal.fire({
          title: (error.code == '401' ? '' : error.code),
          text: (error.code == '401' ? 'Sorry, the username and password do not match. Please try again.' : error.message),
          imageUrl: (error.code == '401' ? "assets/img/swal-icon/Account.svg" : 'assets/img/error 1.svg'),
          confirmButtonText: (error.code == '401' ? "Okay" : "Try Again"),
        })
      }
    })
  }

  submit() {
    if (this.forgotPasswordForm.controls['phone'].value) {
      this.forgotPasswordWithMobile();
    } else {
      this.forgotPasswordWithEmail();
    }
  }

  goToLogin() {
    // this.countlyService.addEvent("signINButtonClick", {
    //   page: location.pathname + location.hash,
    //   trigger: "CTA",
    //   channel: "web",
    // });
    this.router.navigate(["/login"]);
  }

}
