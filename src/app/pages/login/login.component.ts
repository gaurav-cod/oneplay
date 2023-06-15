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
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
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
  @ViewChild("verifySwalModal") verifySwalModal: ElementRef<HTMLDivElement>;

  private _verifySwalModalRef: NgbModalRef;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly ngbModal: NgbModal,
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
        if(error.message == "Please verify your email and phone number") {
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

  private resendVerificationLink(error: any, token: string) {
    const email = this.loginForm.value.id;
    const password = this.loginForm.value.password;
    this.restService.resendVerificationLink(email, password).subscribe({
      next: () => {
        Swal.fire({
          icon: "success",
          text: "Check your email and verify again",
        });
      }
    });
  }

  get domain() {
    return environment.domain;
  }
}
