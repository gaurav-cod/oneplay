import { Component, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
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

  email = new UntypedFormControl("", [Validators.required, Validators.email]);
  country_code = new UntypedFormControl("+91", [Validators.required]);
  phone = new UntypedFormControl("", [
    Validators.required,
    phoneValidator("country_code"),
  ]);
  nonFunctionalRegion: boolean = null;
  resetemail = false;
  get countryCodes() {
    return Object.values(contryCodeCurrencyMapping);
  }
  get phoneErrored() {
    const control = this.phone;
    return control.touched && control.invalid;
  }

  constructor(
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly router: Router,
    private readonly countlyService: CountlyService,
  ) { }

  ngOnInit(): void {
    this.title.setTitle("Forgot Password");
    this.countryCodeSub = this.country_code.valueChanges.subscribe(() =>
      this.phone.updateValueAndValidity()
    );
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (contryCodeCurrencyMapping[res.currency]) {
          this.country_code.setValue(
            contryCodeCurrencyMapping[res.currency]
          );
          this.nonFunctionalRegion = false;
        } else {
          this.nonFunctionalRegion = true;
        }
        if (res.hosting) {
          Swal.fire({
            title: "Alert!",
            html: "We've detected you're using a VPN! <br/> This may cause performance issues.",
            imageUrl: "assets/img/error/vpn_icon.svg",
            confirmButtonText: "Okay",
          });
        }
      },
    });
  }

  forgotPasswordWithEmail() {
    this.restService.requestResetPassword(this.email.value).subscribe(
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
    const phone = this.country_code.value + this.phone.value;
    this.restService.requestResetPasswordWithMobile(phone).subscribe({
      next: () => {
        this.router.navigate(['/otp-verify'], { queryParams: { mobile: phone } });
      }, error: (error) => {
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
          confirmButtonText: "Try Again",
        })
      }
    })
  }

  submit() {
    if (this.phone.value) {
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

  get domain() {
    return environment.domain;
  }
}
