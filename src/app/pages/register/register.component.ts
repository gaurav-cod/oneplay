import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
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

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChild("successSwalModal") successSwalModal: ElementRef<HTMLDivElement>;

  private _successSwalModalRef: NgbModalRef;
  private _signupEvent: StartEvent<"signUpFormSubmitted">;

  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  referralName = "";

  nonFunctionalRegion: boolean = null;

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
      Validators.pattern(/^[0-9]{10}$/),
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

  readonly contryCodeCurrencyMapping = {
    INR: "+91",
    MYR: "+60",
    SGD: "+65",
    KRW: "+82",
    AED: "+971",
    QAR: "+974",
  };

  get countryCodes() {
    return Object.values(this.contryCodeCurrencyMapping);
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
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit() {
    this.title.setTitle("Signup");
    this.startSignupEvent();
    const ctrl = this.registerForm.controls["referred_by_id"];
    this.route.queryParams.subscribe((params) => {
      if (!params["ref"]) return;
      ctrl.setValue(params["ref"]);
      ctrl.disable();
      this.getName(ctrl.value);
    });
    ctrl.valueChanges.subscribe((id) => this.getName(id));
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (this.contryCodeCurrencyMapping[res.currency]) {
          this.registerForm.controls["country_code"].setValue(
            this.contryCodeCurrencyMapping[res.currency]
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
        device: "web",
      })
      .subscribe(
        () => {
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
        },
        (error) => {
          this.loading = false;
          Swal.fire({
            title: "Error Code: " + error.code,
            text: error.message,
            icon: "error",
            confirmButtonText: "Try Again",
          });
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
      },
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
      (error) => (this.referralName = error.message)
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
}
