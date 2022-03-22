import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { RestService } from "src/app/services/rest.service";

declare var gtag: Function;

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  referralName = "";
  registerForm = new FormGroup({
    first_name: new FormControl("", Validators.required),
    last_name: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
    gender: new FormControl("", Validators.required),
    referred_by_id: new FormControl(""),
  });
  loading = false;

  constructor(
    private readonly restService: RestService,
    private readonly toastr: ToastrService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
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
