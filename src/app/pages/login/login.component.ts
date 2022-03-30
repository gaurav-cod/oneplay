import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

declare var gtag: Function;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm = new FormGroup({
    id: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit() {}
  ngOnDestroy() {}

  login() {
    this.restService.login(this.loginForm.value).subscribe(
      (token) => {
        gtag("event", "login", {
          event_category: "user",
          event_label: this.loginForm.value.id,
        });
        this.authService.login(token);
      },
      (error) => {
        this.toastr.error(error, "Login Error!");
      }
    );
  }
}
