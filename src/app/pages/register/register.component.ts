import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {

  @ViewChild("successSwalModal") successSwalModal: ElementRef<HTMLDivElement>;

  private _successSwalModalRef: NgbModalRef;

  referralName = "";
  privacyPolicyPageViewed = false;
  TnCPageViewed = false;
  registerForm = new UntypedFormGroup({
    name: new UntypedFormControl("", [
      Validators.required,
      Validators.pattern(/^[a-zA-Z\s]*$/),
    ]),
    email: new UntypedFormControl("", [Validators.required, Validators.email]),
    country_code: new UntypedFormControl("+91", [
      Validators.required,
    ]),
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
    private readonly countlyService: CountlyService,
  ) {}

  ngOnInit() {
    this.countlyService.startEvent('signup - Form Submitted');
    this.title.setTitle("Signup");
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

  register() {
    const [first_name, ...last_name] = this.registerForm.value.name.split(" ");
    this.loading = true;
    this.countlyService.addEvent('signUPButtonClick', {
      page: location.pathname + location.hash,
      trigger: 'CTA',
    });
    this.countlyService.endEvent('signup - Form Submitted', { segments: {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      phoneNumber: this.registerForm.value.country_code + this.registerForm.value.phone,
      gender: this.registerForm.value.gender,
      referralID: this.registerForm.value.referred_by_id,
      signupFromPage: location.pathname + location.hash,
      privacyPolicyPageViewed: this.privacyPolicyPageViewed ? 'yes' : 'no',
      TnCPageViewed: this.TnCPageViewed ? 'yes' : 'no',
    }});
    this.restService
      .signup({
        first_name: first_name,
        last_name: last_name?.join(' ') ?? "",
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
          this._successSwalModalRef = this.ngbModal.open(this.successSwalModal, {
            centered: true,
            modalDialogClass: "modal-md",
            scrollable: true,
            backdrop: "static",
            keyboard: false,
          });
          // Swal.fire({
          //   title: "Success",
          //   text: "Please check your email to confirm your email id",
          //   icon: "success",
          //   confirmButtonText: "OK",
          //   allowOutsideClick: false,
          //   allowEscapeKey: false,
          // }).then((result) => {
          //   if (result.isConfirmed) {
          //     this.router.navigateByUrl("/login");
          //   }
          // });
          // this.countlyService.add_event({key: 'signup', segmentation: {
          //   event_category: "user",
          //   event_label: this.registerForm.value.email,
          // }})
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

  private resendVerificationLink(error: any, token: string) {
    const password = this.registerForm.value.password;
    const email = this.registerForm.value.email;
    this.restService.resendVerificationLink(email, password).subscribe({
      next: () => {
        this._successSwalModalRef.close();
        Swal.fire({
          icon: "success",
          text: "Check your email and verify again",
        }).then(() => this.router.navigateByUrl("/login"));
      }
    });
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
}
