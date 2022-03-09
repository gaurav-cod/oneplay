import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { RestService } from "src/app/services/rest.service";

declare var gtag: Function;

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    first_name: new FormControl("", Validators.required),
    last_name: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
    gender: new FormControl("", Validators.required),
  });
  loading = false;

  constructor(
    private readonly restService: RestService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit() {}

  register() {
    this.loading = true;
    this.restService.signup(this.registerForm.value).subscribe(
      () => {
        this.loading = false;
        this.toastr.success(
          "Please check your email to confirm your email id",
          "Success"
        );
        gtag("event", "signup", {
          event_category: "user",
          event_label: this.registerForm.value.email,
        });
      },
      (error) => {
        this.loading = false;
        this.toastr.error(error, "Signup Error");
      }
    );
  }
}
