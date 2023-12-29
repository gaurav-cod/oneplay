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
  errorMessage: string;

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
    this.restService.requestResetPassword(this.forgotPasswordForm.controls['email'].value).subscribe(
      () => {
        this.resetemail = true;

      },
      (error) => {
        this.showError(error);
    }
    );
  }
  forgotPasswordWithMobile() {
    const phone = this.forgotPasswordForm.controls['country_code'].value + this.forgotPasswordForm.controls['phone'].value;
    this.restService.requestResetPasswordWithMobile(phone).subscribe({
      next: () => {
        this.router.navigate(['/otp-verify'], { queryParams: { mobile: phone } });
      }, error: (error) => {
        if (error.code == 429) {
          this.router.navigate(['/login']);
        }else {
          this.errorMessage = error.message;
        }
        // Swal.fire({
        //   title: error.message,
        //   imageUrl: "assets/img/swal-icon/Account.svg",
        //   confirmButtonText: "Okay",
        // }).then(() => {
        //   if (error.code == 429)
        //     this.router.navigate(['/login']);
        // })
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

  onKeyPressCheckMobile(event:KeyboardEvent){
    this.errorMessage = null;
    const charCode=event.charCode;
    if(charCode<48 || charCode>57){
      event.preventDefault();
    }
  }

  onKeyPressCheckEmail(event: KeyboardEvent) {
    const charCode = event.charCode;
    const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_+@';
    if (!validChars.includes(String.fromCharCode(charCode))) {
      event.preventDefault();
    }
  }

  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      imageHeight: '80px',
      imageWidth: '80px',
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.CTAs?.length > 1,
      cancelButtonText: ( error.data.CTAs?.indexOf(error.data.primary_CTA) == 0 ? error.data.CTAs[1] : error.data.CTAs[0] )
    }).then((response)=> {
      if (response.isConfirmed) {
        if (error.data.primary_CTA === "SIGN UP") {
          this.router.navigate(['/register']);
        } else if (error.data.primary_CTA === "REQUEST") {
          this.router.navigate(['/forgot-password'])
        }
      }
    })
  }

}
