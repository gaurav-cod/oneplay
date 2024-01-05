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
import { ActivatedRoute, Router } from "@angular/router";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
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
  @ViewChild("ContactUs") contactUs: ElementRef<HTMLDialogElement>;

  private _verifySwalModalRef: NgbModalRef;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly ngbModal: NgbModal,
    private readonly countlyService: CountlyService
  ) { }

  ngAfterViewInit(): void {
    this.emailId.nativeElement.focus();
  }

  ngOnInit() {
    this.title.setTitle("Login");
    this.startSignInEvent();
  }

  ngOnDestroy() {
    this.countlyService.cancelEvent("signIn");
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
      (res) => {
        this.countlyService.endEvent("signIn", { result: 'success'});
        this.startSignInEvent();
        this.authService.trigger_speed_test = res.trigger_speed_test;
        const code: string = this.route.snapshot.queryParams["code"];
        if (!!code && /\d{4}-\d{4}/.exec(code)) {
          this.restService.setQRSession(code, res.session_token).subscribe({
            next: ()=>{},
            error: (error)=> {
              this.showError(error);
            }
          });
        }
        this.authService.login(res.session_token);
      },
      (error) => {
        this.countlyService.endEvent("signIn", { result: 'failure' });
        this.startSignInEvent();
        if (error.message == "Please verify your email and phone number") {
          this._verifySwalModalRef = this.ngbModal.open(this.verifySwalModal, {
            centered: true,
            modalDialogClass: "modal-md",
            scrollable: true,
            backdrop: "static",
            keyboard: false,
          });
        } else {
          this.showError(error);
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
      error: () => {
        this.showError(error);
      }
    });
  }

  goToSignup() {
    this.countlyService.startEvent("signUpFormSubmitted", {
      discardOldData: true,
      data: { signUpFromPage: 'signIn' }
    });
    this.router.navigate(["/register"]);
  }

  get domain() {
    return environment.domain;
  }

  private startSignInEvent() {
    this.countlyService.startEvent("signIn", { discardOldData: false });
    const segments = this.countlyService.getEventData("signIn");
    if (!segments.signInFromPage) {
      this.countlyService.updateEventData("signIn", {
        signInFromPage: "directLink",
      })
    }
  }
  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    }).then((response)=> {
      if (response.isConfirmed && (error.data.primary_CTA?.includes("Contact"))) {
        this.contactUs.nativeElement.click();
      }
    })
  }
}
