import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { RestService } from "src/app/services/rest.service";
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
    // last_name: new FormControl("", Validators.required),
    email: new FormControl("", [Validators.required, Validators.email]),
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

  get password(): string {
    return this.registerForm.controls["password"].value || "";
  }

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
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
  }

  register() {
    const [first_name, last_name] = this.registerForm.value.name.split(' ');
    this.loading = true;
    this.restService
      .signup({
        first_name: first_name,
        last_name: last_name??'',
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        gender: this.registerForm.value.gender,
        referred_by_id: this.registerForm.value.referred_by_id,
        phone: `+91${this.registerForm.value.phone}`,
      })
      .subscribe(
        () => {
          this.loading = false;
          Swal.fire({
            title: "Success",
            text: "Please check your email to confirm your email id",
            icon: "success",
            confirmButtonText: "OK",
          });
          gtag("event", "signup", {
            event_category: "user",
            event_label: this.registerForm.value.email,
          });
        },
        (error) => {
          this.loading = false;
          Swal.fire({
            title: "Error",
            text: error,
            icon: "error",
            confirmButtonText: "OK",
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
      (error) => (this.referralName = error)
    );
  }
}
