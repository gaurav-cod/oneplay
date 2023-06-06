import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import UAParser from "ua-parser-js";

declare var gtag: Function;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  loginForm = new UntypedFormGroup({
    id: new UntypedFormControl("", Validators.required),
    password: new UntypedFormControl("", Validators.required),
  });

  @ViewChild("emailId") emailId: ElementRef<HTMLInputElement>;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly title: Title
  ) {}
  ngAfterViewInit(): void {
    this.emailId.nativeElement.focus();
  }

  ngOnInit() {
    this.title.setTitle("Login");
  }
  ngOnDestroy() {
    Swal.close();
  }

  get isTV() {
    const userAgent = new UAParser();
    return userAgent.getDevice().type === "smarttv";
  }

  login() {
    if (
      this.loginForm.value.id === "" ||
      this.loginForm.value.password === ""
    ) {
      Swal.fire({
        title: "Oops...",
        text: "Email and Password cannot be empty.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }

    this.restService.login(this.loginForm.value).subscribe(
      (token) => {
        gtag("event", "login", {
          event_category: "user",
          event_label: this.loginForm.value.id,
        });
        const code: string = this.route.snapshot.queryParams["code"];
        if (!!code && /\d{4}-\d{4}/.exec(code)) {
          this.restService.setQRSession(code, token).subscribe();
        }
        this.authService.login(token);
      },
      (error) => {
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    );
  }

  get domain() {
    return environment.domain;
  }
}
