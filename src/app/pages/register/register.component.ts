import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

declare var gtag: Function;

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  referralName = "";
  registerForm = new FormGroup({
    name: new FormControl("", Validators.required),
    email: new FormControl("", [Validators.required, Validators.email]),
    country_code: new FormControl("+91", [Validators.required]),
    phone: new FormControl("", [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/),
    ]),
    password: new FormControl("", [
      Validators.required,
      Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
    ]),
    gender: new FormControl("", Validators.required),
    referred_by_id: new FormControl(""),
    terms_checked: new FormControl(false, [Validators.requiredTrue]),
  });
  loading = false;

  showPassword = false;

  passwordChecks = [
    {
      name: "1 uppercase character",
      regex: /[A-Z]/,
    },
    {
      name: "1 lowercase character",
      regex: /[a-z]/,
    },
    {
      name: "1 number",
      regex: /[0-9]/,
    },
    {
      name: "8 characters minimum",
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

  get password(): string {
    return this.registerForm.controls["password"].value || "";
  }

  get domain(): string {
    return environment.domain;
  }

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title
  ) {}

  ngOnInit() {
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
    const [first_name, last_name] = this.registerForm.value.name.split(" ");
    this.loading = true;
    this.restService
      .signup({
        first_name: first_name,
        last_name: last_name ?? "",
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
          Swal.fire({
            title: "Success",
            text: "Please check your email to confirm your email id",
            icon: "success",
            confirmButtonText: "OK",
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigateByUrl("/login");
            }
          });
          gtag("event", "signup", {
            event_category: "user",
            event_label: this.registerForm.value.email,
          });
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
