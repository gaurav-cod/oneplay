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
import { StartEvent } from 'src/app/services/countly';
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
  private _signupEvent: StartEvent<"signup - Form Submitted">;

  referralName = "";

  registerForm = new UntypedFormGroup({
    name: new UntypedFormControl("", [
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s]*$/),
    ]),
    email: new UntypedFormControl("", [Validators.required, Validators.email]),
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

  readonly countryCodes = [
    "+91",
    "+850",
    "+82",
    "+84",
    "+7",
    "+1",
    "+60",
    "+98",
    "+971",
  ];

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
        if (this.countryCodes.includes(res.country_calling_code)) {
          this.registerForm.controls["country_code"].setValue(
            res.country_calling_code
          );
        }
      },
    });
  }

  ngOnDestroy(): void {
    this._signupEvent.cancel();
  }

  register() {
    const [first_name, ...last_name] = this.registerForm.value.name.trim().split(" ");
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
          this.endSignupEvent();
          this.startSignupEvent();
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
    this._signupEvent.update({ privacyPolicyPageViewed: "yes" });
  }

  onClickTNC() {
    this._signupEvent.update({ TnCPageViewed: "yes" });
  }

  goToLogin() {
    this.countlyService.addEvent("signINButtonClick", {
      page: location.pathname + location.hash,
      trigger: "CTA",
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
    this._signupEvent = this.countlyService.startEvent(
      "signup - Form Submitted",
      {
        unique: false,
        data: {
          signupFromPage: location.pathname + location.hash,
          privacyPolicyPageViewed: "no",
          TnCPageViewed: "no",
        },
      }
    );
  }

  private endSignupEvent() {
    this._signupEvent.end({
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      phoneNumber:
        this.registerForm.value.country_code + this.registerForm.value.phone,
      gender: this.registerForm.value.gender,
      referralID: this.registerForm.value.referred_by_id,
      signupFromPage: location.pathname + location.hash,
    });
  }
}
