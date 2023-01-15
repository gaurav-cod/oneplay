import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

declare var gtag: Function;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  loginForm = new FormGroup({
    id: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });

  @ViewChild("emailId") emailId: ElementRef<HTMLInputElement>;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly title: Title
  ) {}
  ngAfterViewInit(): void {
    this.emailId.nativeElement.focus();
  }

  ngOnInit() {
    this.title.setTitle("Login");
  }
  ngOnDestroy() {}

  login() {
    if (
      this.loginForm.value.id === "" ||
      this.loginForm.value.password === ""
    ) {
      Swal.fire({
        title: "Error",
        text: "Email or Phone number and Password cannot be empty.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    this.restService.login(this.loginForm.value).subscribe(
      (token) => {
        gtag("event", "login", {
          event_category: "user",
          event_label: this.loginForm.value.id,
        });
        this.authService.login(token);
      },
      (error) => {
        Swal.fire({
          title: "Error",
          text: error,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    );
  }
}
