import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CountlyService } from "src/app/services/countly.service";
import { StartEvent } from "src/app/services/countly";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { phoneValidator } from "src/app/utils/validators.util";
import { Subscription, debounceTime, distinctUntilChanged } from "rxjs";
import { contryCodeCurrencyMapping } from "src/app/variables/country-code";
import { ReferrerService } from "src/app/services/referrer.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChild("successSwalModal") successSwalModal: ElementRef<HTMLDivElement>;
  @ViewChild("DiscordLink") discordLink: ElementRef<HTMLDivElement>;


  private _successSwalModalRef: NgbModalRef;
  private _signupEvent: StartEvent<"signUpFormSubmitted">;
  private _deviceType: "WEB" | "TIZEN" = "WEB";

  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  referralName = "";
  private countryCodeSub: Subscription;
  private referralSub: Subscription;

  nonFunctionalRegion: boolean = null;
  successIcon: string = null;
  successMessage: string = null;

  registerForm = new UntypedFormGroup({
    name: new UntypedFormControl("", [
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s]*$/),
    ]),
    email: new UntypedFormControl("", [
      Validators.required,
      Validators.email,
      Validators.pattern(this.emailPattern),
    ]),
    country_code: new UntypedFormControl("+91", [Validators.required]),
    phone: new UntypedFormControl("", [
      Validators.required,
      phoneValidator("country_code"),
    ]),
    password: new UntypedFormControl("", [
      Validators.required,
      Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
    ]),
    gender: new UntypedFormControl("", Validators.required),
    referred_by_id: new UntypedFormControl(""),
    terms_checked: new UntypedFormControl(false, [Validators.requiredTrue]),
  });

  loading = false;

  showPassword = false;

  passwordChecks = [
    {
      name: "*atleast 1 uppercase",
      regex: /[A-Z]/,
    },
    {
      name: "*atleast 1 lowercase",
      regex: /[a-z]/,
    },
    {
      name: "*atleast 1 number",
      regex: /[0-9]/,
    },
    {
      name: "*8 characters minimum",
      regex: /.{8,}/,
    },
  ];

  get countryCodes() {
    return Object.values(contryCodeCurrencyMapping);
  }

  get checkvalidationValue() {
    return this.registerForm.invalid || this.loading;
  }

  get nameErrored() {
    const control = this.registerForm.controls["name"];
    return control.touched && control.invalid;
  }

  get emailErrored() {
    const control = this.registerForm.controls["email"];
    return control.touched && control.invalid;
  }

  get phoneErrored() {
    const control = this.registerForm.controls["phone"];
    return control.touched && control.invalid;
  }

  get passwordErrored() {
    const control = this.registerForm.controls["password"];
    return control.touched && control.invalid;
  }

  get domain(): string {
    return environment.domain;
  }

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly ngbModal: NgbModal,
    private readonly countlyService: CountlyService,
    private readonly referrerService:ReferrerService,
  ) {}

  ngOnInit() {
    const referrer = this.referrerService.getReferrer();
    if (referrer === 'tizen') {
      this._deviceType = "TIZEN";

    } 
    this.title.setTitle("Signup");
    this.startSignupEvent();
    const ctrl = this.registerForm.controls["referred_by_id"];
    this.route.params.subscribe((param)=> {
      if (!param["device"] || param["device"] != 'tizen') return;
      this._deviceType = "TIZEN";
    })
    this.route.queryParams.subscribe((params) => {
      if (!params["ref"]) return;
      ctrl.setValue(params["ref"]);
      ctrl.disable();
      this.getName(ctrl.value);
    });
    this.referralSub = ctrl.valueChanges .pipe(
      debounceTime(1000),
      distinctUntilChanged() 
    ).subscribe((id) => this.getName(id));
    this.countryCodeSub = this.registerForm.controls[
      "country_code"
    ].valueChanges.subscribe(() =>
      this.registerForm.controls["phone"].updateValueAndValidity()
    );
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (contryCodeCurrencyMapping[res.countryCode]) {
          this.registerForm.controls["country_code"].setValue(
            contryCodeCurrencyMapping[res.countryCode]
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

  ngOnDestroy(): void {
    this._signupEvent.cancel();
    this.countryCodeSub?.unsubscribe();
    this.referralSub?.unsubscribe();
  }

  register() {
    const [first_name, ...last_name] = this.registerForm.value.name
      .trim()
      .split(" ");
    this.loading = true;
    this.restService
      .signup({
        first_name: first_name,
        last_name: last_name?.join(" ") ?? "",
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        gender: this.registerForm.value.gender,
        referred_by_id: this.registerForm.value.referred_by_id,
        phone:
          this.registerForm.value.country_code + this.registerForm.value.phone,
        device: (this._deviceType === "TIZEN" ? "tizen" : "web") ,
      })
      .subscribe(
        (response: any) => {
          this.loading = false;
          this.endSignupEvent();
          this._successSwalModalRef = this.ngbModal.open(
            this.successSwalModal,
            {
              centered: true,
              modalDialogClass: "modal-md",
              scrollable: true,
              backdrop: "static",
              keyboard: false,
            }
          );
          this.successIcon = response.data?.icon;
          this.successMessage = response.data?.message;
        },
        (error) => {
          this.loading = false;
          this.showError(error);
         
        }
      );
  }

  resendVerificationLink(error: any, token: string) {
    const password = this.registerForm.value.password;
    const email = this.registerForm.value.email;
    this.restService.resendVerificationLink(email, password).subscribe({
      next: () => {
        this._successSwalModalRef?.close();
        Swal.fire({
          icon: "success",
          text: "Check your email and verify again",
        }).then(() => this.goToLogin());
      }, error: (error) => {
        this.showError(error);
      }
    });
  }

  onClickPrivacy() {
    this._signupEvent.update({ privacyPolicyViewed: "yes" });
  }

  onClickTNC() {
    this._signupEvent.update({ tncViewed: "yes" });
  }

  goToLogin() {
    this.countlyService.startEvent("signIn", {
      data: { signInFromPage: "signUp" },
      discardOldData: true,
    });
    this.router.navigate(["/login"]);
  }

  closeSuccess() {
    this._successSwalModalRef?.close();
    this.goToLogin();
  }

  private getName(id: string) {
    if (id.trim() === "") {
      this.referralName = "";
      return;
    }
    this.restService.getName(id).subscribe(
      (name) => (this.referralName = name),
      (error) => (this.showError(error))
    );
  }

  private startSignupEvent() {
    this._signupEvent = this.countlyService.startEvent("signUpFormSubmitted", {
      discardOldData: false,
      data: {
        name: "no",
        email: "no",
        phoneNumber: "no",
        gender: "no",
        password: "no",
        referralId: "no",
        tncViewed: "no",
        privacyPolicyViewed: "no",
      },
    });
    const segments = this._signupEvent.data();
    if (!segments.signUpFromPage) {
      this._signupEvent.update({
        signUpFromPage: "directLink",
      });
    }
  }

  private endSignupEvent() {
    this._signupEvent.end({
      name: "yes",
      email: "yes",
      phoneNumber: "yes",
      gender: "yes",
      password: "yes",
      referralId: this.registerForm.value.referred_by_id === "" ? "no" : "yes",
    });
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
      if (response.isConfirmed && (error.data.secondary_CTA?.includes("Contact") || error.data.primary_CTA.includes("Contact"))) {
        this.discordLink.nativeElement.click();
      }
    })
  }
}
