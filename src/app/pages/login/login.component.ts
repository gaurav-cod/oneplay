import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { StartEvent } from 'src/app/services/countly';
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import UAParser from "ua-parser-js";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  rememberMe = true;
  loginForm = new UntypedFormGroup({
    id: new UntypedFormControl("", Validators.required),
    password: new UntypedFormControl("", Validators.required),
  });

  @ViewChild("emailId") emailId: ElementRef<HTMLInputElement>;
  @ViewChild("verifySwalModal") verifySwalModal: ElementRef<HTMLDivElement>;

  private _verifySwalModalRef: NgbModalRef;
  private _signinEvent: StartEvent<"signin">;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly ngbModal: NgbModal,
    private readonly countlyService: CountlyService
  ) {}

  ngAfterViewInit(): void {
    this.emailId.nativeElement.focus();
  }

  ngOnInit() {
    this.title.setTitle("Login");
    this.startSignupEvent();
  }

  ngOnDestroy() {
    this._signinEvent.cancel();
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

    this.countlyService.addEvent("signINButtonClick", {
      page: location.pathname + location.hash,
      trigger: "click",
    });
    this._signinEvent.update({
      signinFromTrigger: "click",
      rememberMeActivated: this.rememberMe ? "yes" : "no",
    });
    this.restService.login(this.loginForm.value).subscribe(
      (token) => {
        this._signinEvent.end({ result: "success" });
        const code: string = this.route.snapshot.queryParams["code"];
        if (!!code && /\d{4}-\d{4}/.exec(code)) {
          this.restService.setQRSession(code, token).subscribe();
        }
        this.authService.login(token);
      },
      (error) => {
        this._signinEvent.end({ result: "failure" });
        this.startSignupEvent();
        if (error.message == "Please verify your email and phone number") {
          this._verifySwalModalRef = this.ngbModal.open(this.verifySwalModal, {
            centered: true,
            modalDialogClass: "modal-md",
            scrollable: true,
            backdrop: "static",
            keyboard: false,
          });
        } else {
          Swal.fire({
            title: "Error Code: " + error.code,
            text: error.message,
            icon: "error",
            confirmButtonText: "Try Again",
          });
        }
      }
    );
  }

  resendVerificationLink(error: any, token: string) {
    const email = this.loginForm.value.id;
    const password = this.loginForm.value.password;
    this.restService.resendVerificationLink(email, password).subscribe({
      next: () => {
        this._verifySwalModalRef.close();
        Swal.fire({
          icon: "success",
          text: "Check your email and verify again",
        });
      },
    });
  }

  get domain() {
    return environment.domain;
  }

  private startSignupEvent() {
    this._signinEvent = this.countlyService.startEvent("signin", {
      unique: false,
      data: { signinFromPage: location.pathname + location.hash },
    });
  }
}
