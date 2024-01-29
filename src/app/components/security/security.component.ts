import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  genDefaultMenuClickSegments,
  genDefaultMenuDropdownClickSegments,
  getGameLandingViewSource,
} from "src/app/utils/countly.util";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { CustomCountlyEvents } from "src/app/services/countly";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { phoneValidator } from "src/app/utils/validators.util";
import { contryCodeCurrencyMapping } from "src/app/variables/country-code";
// import { EventEmitter } from "stream";
import Swal from "sweetalert2";
import { ActivatedRoute, Router } from "@angular/router";
import { MessagingService } from "src/app/services/messaging.service";

@Component({
  selector: "app-security",
  templateUrl: "./security.component.html",
  styleUrls: ["./security.component.scss"],
})
export class SecurityComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("changeEmailModal") changeEmailModal: ElementRef<HTMLDivElement>;
  @ViewChild("changePhoneModal") changePhoneModal: ElementRef<HTMLDivElement>;
  @ViewChild("createPassModal") createPasswordModal: ElementRef<HTMLDivElement>;
  @ViewChild("changePasswordModal")
  changePasswordModal: ElementRef<HTMLDivElement>;
  @ViewChild("otpScreen") otpScreen: ElementRef<HTMLDivElement>;
  
  // close all poups when component is destroyed
  isComponentDestroyed: boolean = false;

  buttonEmailChangeText: string = "Confirm";
  buttonText: string = "Continue";
  isVerify: boolean = true;
  isPhone: boolean = true;
  emailOTP: boolean = true;
  remainingTimer = false;
  display: any;
  allowEmailEdit: boolean = true;
  allowPhoneEdit: boolean = true;
  allowPasswordEdit: boolean = true;

  public resetPasswordToken: string | null = null;

  private emailIconHideTimer: NodeJS.Timeout;
  private phoneIconHideTimer: NodeJS.Timeout;
  private passwordIconHideTimer: NodeJS.Timeout;
  private logoutRef: NgbModalRef;
  private _createPassModalRef: NgbModalRef;
  private _forgotPasswordModalRef: NgbModalRef;
  private _forgotPasswordOTPScreen: NgbModalRef;

  errorMessage: string;
  errorCode: number;

  get endJourney() {
    return this.errorCode == 429;
  }

  email = new UntypedFormControl("", [
    Validators.required,
    Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
  ]);
  phoneForm = new UntypedFormGroup({
    country_code: new UntypedFormControl("+91", [Validators.required]),
    phone: new UntypedFormControl("", [
      Validators.required,
      phoneValidator("country_code"),
    ]),
  });
  updateSecurity = new UntypedFormGroup({
    oldPassword: new UntypedFormControl("", [
      Validators.required,
      Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
    ]),
    password: new UntypedFormControl("", [
      Validators.required,
      Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
    ]),
    confirmPassword: new UntypedFormControl("", [Validators.required]),
  });

  get countryCodes() {
    return Object.values(contryCodeCurrencyMapping);
  }

  showPass = false;
  isPrivate: boolean = false;
  passwordExist: boolean = false;
  emailExist: boolean = false;

  passwordInputContainer = {
    showPasswordToText: false,
    showConfPasswordToText: false
  }

  user: UserModel;
  private _changeEmailModalRef: NgbModalRef;
  private _changePhoneModalRef: NgbModalRef;
  private _changePasswordModalRef: NgbModalRef;
  private _otpScreenRef: NgbModalRef;

  private _countryCodeSub: Subscription;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly countlyService: CountlyService,
    private readonly ngbModal: NgbModal,
    private readonly router: Router,
    private readonly messagingService: MessagingService,
    private readonly activatedRoute: ActivatedRoute
  ) {
     this.authService.user.subscribe((user) => {
      this.user = user;
      this.isPrivate = this.user?.searchPrivacy;
      this.emailExist = this.user?.email?.length > 0;
      
      this.passwordExist = this.user.hasPassword;
      // this.phone.setValue(user.phone);
      // this.email.setValue(user.email);
    });
  }

  ngAfterViewInit(): void {

    this.activatedRoute.queryParams.subscribe((qParam)=> {
      if (qParam['dialogType'] == "RESET_PASS") {
        this.openPasswordModal();
      }
    })
  }

  ngOnDestroy(): void {
    this.isComponentDestroyed = true;
    this._countryCodeSub?.unsubscribe();
    this._otpScreenRef?.close();
    this._changePasswordModalRef?.close();
    this._changeEmailModalRef?.close();
    this._changePhoneModalRef?.close();
    this.logoutRef?.close();
    this._forgotPasswordModalRef?.close();
    this._forgotPasswordOTPScreen?.close();
    Swal.close();
  }

  ngOnInit(): void {
    this.countlyService.updateEventData("settingsView", {
      logInSecurityViewed: "yes",
    });
    this._countryCodeSub = this.phoneForm.controls[
      "country_code"
    ].valueChanges.subscribe(() =>
      this.phoneForm.controls["phone"].updateValueAndValidity()
    );
  }

  get checkvalidationValue() {
    if (
      this.updateSecurity.value.oldPassword &&
      this.updateSecurity.value.password?.length &&
      this.updateSecurity.value.password ===
      this.updateSecurity.value.confirmPassword
    ) {
      return false;
    } else {
      return true;
    }
  }

  get oldPasswordErrored() {
    const control = this.updateSecurity.controls["oldPassword"];
    return control.touched && control.invalid && control.value?.length > 0;
  }

  get phoneErrored() {
    const control = this.phoneForm.controls["phone"];
    return control.touched && control.invalid && control.value?.length > 0;
  }

  get emailErrored() {
    return this.email.touched && this.email.invalid && this.email.value?.length > 0;
  }

  get passwordErrored() {
    const control = this.updateSecurity.controls["password"];
    return control.touched && control.invalid && control.value?.length > 0;
  }

  get confirmPasswordErrored() {
    const control = this.updateSecurity.controls["confirmPassword"];
    if (
      this.updateSecurity.value.password !==
      this.updateSecurity.value.confirmPassword
    ) {
      return control.touched && true;
    } else {
      return control.touched && false;
    }
  }
  get createPasswordErrored() {
    const newPasswordcontrol = this.updateSecurity.controls["password"];
    const confPasswordcontrol = this.updateSecurity.controls["confirmPassword"];
    return (this.passwordErrored || this.confirmPasswordErrored) || (newPasswordcontrol.value?.length == 0 || confPasswordcontrol.value?.length == 0);
  }

  timer(minute) {
    let seconds: any = 60;
    const timer = setInterval(() => {
      seconds--;
      const prefix = seconds < 10 ? "0" : "";
      this.display = `${prefix}${seconds}`;
      this.remainingTimer = true;
      if (seconds == 0) {
        this.remainingTimer = false;
        clearInterval(timer);
      }
    }, 1000);
  }

  private openOTPScreen() {
    this._otpScreenRef = this.ngbModal.open(this.otpScreen, {
      centered: true,
      modalDialogClass: "modal-sm",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  createPassword() {
    
    this.errorMessage = null;
    this.restService.createPassword(this.updateSecurity.value.password).subscribe((response)=> {
        this._createPassModalRef?.close();
        this.resetPasswordToken = null;
        this.updateSecurity.controls["password"].setValue(null);
        this.updateSecurity.controls["confirmPassword"].setValue(null);
        this.errorMessage = null;
        this.passwordExist = true;
        this.authService.updateProfile({ hasPassword: true });
        this.user
        Swal.fire({
          icon: "success",
          text: "Password Created Successfully",
          showConfirmButton: false,
          showCancelButton: false,
        });
    }, (error: any)=> {
      this.errorMessage = error.message;
    })
  }

  openEmailModal() {
    this.emailOTP = true;
    this.errorMessage = null;
    this._changeEmailModalRef = this.ngbModal.open(this.changeEmailModal, {
      centered: true,
      modalDialogClass: "modal-sm",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
  }
  closeCreatePassModal() {
    this._createPassModalRef?.close();
    this.errorMessage = null;
    this.resetPasswordToken = null;
    this.updateSecurity.controls["password"].setValue(null);
    this.updateSecurity.controls["confirmPassword"].setValue(null);
  }

  emailOperation() {
    this.errorMessage = null;
    if (this.emailErrored) return;
    if (this.user?.email === this.email.value?.trim()) {
      this.errorMessage = "This email address is already in use.";
      return;
    }
    // if (this.emailExist) {
    this.updateEmail();
    
  }

  updateEmail(): void {

    this.errorMessage = null;
    this.errorCode = null;
    this.restService.updateEmail(this.email.value).subscribe(
      () => {
        this.clearErrors();
        this._changeEmailModalRef.close();
        this.timer(1);
        this.openOTPScreen();
      },
      (error) => {
        
        this.errorCode = error.code;
        this.errorMessage = error.message;
        // this.showError(error);
      }
    );
  }

  resendEmailUpdate() {
    this.errorCode = null;
    this.errorMessage = null;
    this.restService.resendEmailRequestUpdate().subscribe(
      () => {
        this.timer(1);
      },
      (error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
      }
    );
  }
  resetValidation() {
    
  }

  resendUpdateEmail() {
    this.errorCode = null;
    this.errorMessage = null;
    this.restService.resendUpdateEmail().subscribe(
      () => {
        this.timer(1);
      },
      (error) => {
        
        this.errorCode = error.code;
        this.errorMessage = error.message;
        // this.showError(error);
      }
    );
  }

  verfiyEmail(data: string) {
    this.errorCode = null;
    this.errorMessage = null;
    this.restService.verifyEmailUpdate(data).subscribe(
      () => {
        this.clearErrors();
        this._otpScreenRef.close();
        this.isVerify = false;
        this.buttonText = "Confirm";
        this.openOTPScreen();
        this.timer(1);
      },
      (error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
      }
    );
  }

  confirmEmail(data: string) {
    this.errorCode = null;
    this.errorMessage = null;
    this.restService.confirmEmailUpdate(data).subscribe(
      () => {
        this.clearErrors();
        this._otpScreenRef.close();
        Swal.fire({
          icon: "success",
          text: (this.emailExist ? "You have successfully changed your email." : "You have successfully added your email."),
          showConfirmButton: false
        });

        this.emailExist = true;
        
        this.authService.updateProfile({ email: this.email.value, hasPassword: this.passwordExist });
        this.email.reset();
      },
      (error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
        // this.showError(error);
      }
    );
  }

  openPhoneModal() {
    this.emailOTP = false;
    this.errorCode = null;
    this.errorMessage = null;
    this._changePhoneModalRef = this.ngbModal.open(this.changePhoneModal, {
      centered: true,
      modalDialogClass: "modal-sm",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (contryCodeCurrencyMapping[res.currency]) {
          this.phoneForm.controls["country_code"].setValue(
            contryCodeCurrencyMapping[res.currency]
          );
        }
      },
    });
  }

  updatePhone(): void {
    this.errorMessage = null;
    this.errorCode = null;
    if (this.phoneErrored) return;
    const phoneNumber = (this.phoneForm.value.country_code + this.phoneForm.value.phone).trim();
    if (this.user.phone === phoneNumber) {
      this.errorMessage = "This mobile number is already in use.";
      return;
    }
    this.restService
      .updatePhone(phoneNumber)
      .subscribe(
        () => {
          this.clearErrors();
          this._changePhoneModalRef.close();
          this.timer(1);
          this.openOTPScreen();
        },
        (error) => {
          this.errorCode = error.code;
          this.errorMessage = error.message;
        }
      );
  }

  resendPhoneUpdate() {
    this.restService.resendPhoneRequestUpdate().subscribe(
      () => {
        this.timer(1);
      },
      (error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
      }
    );
  }

  resendUpdatePhone() {
    this.restService.resendPhoneUpdate().subscribe(
      () => {
        this.timer(1);
      },
      (error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
      }
    );
  }

  verfiyPhone(data: string) {
    this.restService.verifyPhoneUpdate(data).subscribe(
      () => {
        this.clearErrors();
        this._otpScreenRef.close();
        this.isPhone = false;
        this.buttonText = "Confirm";
        this.openOTPScreen();
        this.timer(1);
      },
      (error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
        // this.showError(error);
      }
    );
  }

  confirmPhone(data: string) {
    this.restService.confirmPhoneUpdate(data).subscribe(
      () => {
        this.clearErrors();
        this._otpScreenRef.close();
        Swal.fire({
          icon: "success",
          text: "You have successfully changed your mobile number.",
          showConfirmButton: false
        });
        this.authService.updateProfile({
          phone: Object.values(this.phoneForm.value).join(""),
        });
        this.phoneForm.controls["phone"].reset();
      },
      (error) => {
        this.errorCode = error.code;
        this.errorMessage = error.message;
      }
    );
  }

  openPasswordModal() {
    this.errorCode = null;
    this.errorMessage = null;
    this._changePasswordModalRef = this.ngbModal.open(
      this.changePasswordModal,
      {
        centered: true,
        modalDialogClass: "modal-md",
        scrollable: true,
        backdrop: "static",
        keyboard: false,
      }
    );
  }

  updatePassword(): void {
    if (this.checkvalidationValue) return;
    this.restService
      .updatePassword(
        this.updateSecurity.value.oldPassword,
        this.updateSecurity.value.password
      )
      .subscribe({
        next: () => {
          this._changePasswordModalRef.close();
          this.errorMessage = null;
          this.errorCode = null;
          Swal.fire({
            icon: "success",
            text: "You have successfully changed your password.",
            showConfirmButton: false
          });
          this.updateSecurity.reset();
          // this.passwordExist = true;
          this.countlyService.updateEventData("settingsView", {
            passwordChanged: "yes",
          });
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.errorCode = error.code;
          // this.showError(error);
          // Swal.fire({
          //   // title: "Error Code: " + error.code,
          //   text: error.message,
          //   icon: "error",
          //   confirmButtonText: "Ok",
          // });
        },
      });
  }

  sendOTPForgotPassword(container: ElementRef<HTMLDivElement>) {
    this.errorCode = null;
    this.errorMessage = null;
      const phone = this.phoneForm.controls['country_code'].value + this.phoneForm.controls['phone'].value;
      this.restService.requestResetPasswordWithMobile(phone).subscribe({
        next: () => {
          this.timer(1);
          this._forgotPasswordModalRef?.close();
          this._forgotPasswordOTPScreen = this.ngbModal.open(container, {
            centered: true,
            modalDialogClass: "modal-sm",
            backdrop: "static",
            keyboard: false,
          });
        }, error: (error) => {
            // this.showError(error);
            this.errorMessage = error.message;
            this.errorCode = error.code;
        }
      })
  }

  openCreatePasswordModal(container: ElementRef<HTMLDivElement>) {
    this.errorCode = null;
    this.errorMessage = null;
    this._createPassModalRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-md",
      backdrop: "static",
      keyboard: false,
    });
  }

  openForgotPassword(container: ElementRef<HTMLDivElement>) {
    this._changePasswordModalRef?.close();
    this.resetPasswordToken = null;
    this.errorCode = null;
    this.errorMessage = null;
    this._forgotPasswordModalRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }
  closeForgotPasswordModal() {
    this.errorCode = null;
    this.errorMessage = null;
    this._forgotPasswordModalRef?.close();
  }

  closeEmailModal() {
    this.errorCode = null;
    this.errorMessage = null;
    this._changeEmailModalRef?.close();
    this._otpScreenRef?.close();
    this.email.reset();
    this.allowEmailEdit = false;
    this.clearErrors();
    
    clearTimeout(this.emailIconHideTimer);
    this.emailIconHideTimer = setTimeout(() => {
      this.allowEmailEdit = true;
    }, 120000); // 2 minutes (2 * 60,000 milliseconds)
  }

  closePhoneModal() {
    this.errorCode = null;
    this.errorMessage = null;
    this._changePhoneModalRef?.close();
    this._otpScreenRef?.close();
    this.phoneForm.reset();
    this.allowPhoneEdit = false;
    this.clearErrors();
   
    clearTimeout(this.phoneIconHideTimer);
    this.phoneIconHideTimer = setTimeout(() => {
      this.allowPhoneEdit = true;
    }, 120000);
  }

  closePasswordModal() {
    this._changePasswordModalRef?.close();
    this.errorMessage = null;
    this.errorCode = null;
    this.updateSecurity.reset();
    this.allowPasswordEdit = false;
    clearTimeout(this.passwordIconHideTimer);
    this.passwordIconHideTimer = setTimeout(() => {
      this.allowPasswordEdit = true;
    }, 120000);
  }

  private clearErrors() {
    this.errorMessage = null;
    this.errorCode = null;
  }
  logDropdownEvent(item: keyof CustomCountlyEvents["menuDropdownClick"]): void {
    this.countlyService.addEvent("menuDropdownClick", {
      ...genDefaultMenuDropdownClickSegments(),
      [item]: "yes",
    });
  }

  deleteSessionData() {
    this.logDropdownEvent("deleteSessionDataClicked");
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete all your session data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        this.logDropdownEvent("deleteSessionDataConfirmClicked");
        this.restService.deleteSessionData().subscribe({
          next: () => {
            Swal.fire({
              title: "Success",
              text: "Successfully deleted sessions",
              icon: "success",
              confirmButtonText: "OK",
            });
          },
          error: (err) => {
            this.showError(err);
          },
        });
      }
    });
  }

  switchSearchPrivacy() {
    const privacy = !this.isPrivate;
    this.logDropdownEvent(
      privacy ? "turnOffPrivacyDisabled" : "turnOffPrivacyEnabled"
    );
    this.authService.updateProfile({ searchPrivacy: privacy });
    this.restService.setSearchPrivacy(privacy).subscribe({
      next: () => {
        this.isPrivate = !this.isPrivate;
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Successfully turned ${privacy ? "on" : "off"} search privacy.`,
          confirmButtonText: "Okay"
        });
      },
      error: (err) => {

        this.authService.updateProfile({ searchPrivacy: !privacy });
        Swal.fire({
          icon: "error",
          title: "Error Code: " + err.code,
          text: err.message,
        });
      },
    });
  }

  verifyForgotPasswordOTP(code: string) {
    
    this.errorCode = null;
    this.errorMessage = null;
    const phone = this.phoneForm.controls['country_code'].value + this.phoneForm.controls['phone'].value;
    this.restService.verifyOTPForMobile(phone, code).subscribe({
      next: (token: any) => {
        this.resetPasswordToken = token;
        this._forgotPasswordOTPScreen?.close();
        this._createPassModalRef = this.ngbModal.open(this.createPasswordModal, {
          centered: true,
          modalDialogClass: "modal-sm",
          backdrop: "static",
          keyboard: false,
        });
      }, error: (error: any) => {

        this.errorCode = error.code;
        this.errorMessage = error.message;
        // this.isWrongOTPEntered = true;
        // this.verifyOTPError = error.message;
      }
    })
  }
  resetPassword() {
    
    this.errorCode = null;
    this.errorMessage = null;
    this.restService.resetPassword(this.resetPasswordToken, this.updateSecurity.controls["password"].value).subscribe(
      () => {
        this._createPassModalRef?.close();
        this.resetPasswordToken = null;
        this.updateSecurity.controls["password"].setValue(null);
        this.updateSecurity.controls["confirmPassword"].setValue(null);
        this.errorMessage = null;
        Swal.fire({
          text: "You have successfully changed your password. Happy Gaming!",
          icon: "success",
          confirmButtonText: "Continue",
          allowEscapeKey: false,
        })
      },
      (error) => {
        this.errorMessage = error.message;
        this.errorCode = error?.code;
        // this.showError(error);
      });
  }
  closeForgoutPasswordOTP() {
    this._forgotPasswordOTPScreen?.close();
  }
  resendUpdatePassword() {
    this.errorMessage = null;
    this.errorCode = null;
    const phone = this.phoneForm.controls['country_code'].value + this.phoneForm.controls['phone'].value;
    this.restService.requestResetPasswordWithMobile(phone).subscribe({
      next: (response: any) => {

        this.timer(1);
      }, error: (error) => {
        this.errorMessage = error.message;
        this.errorCode = error.code;
      }
    })
  }

  tvSignInClicked() {
    this.logDropdownEvent('tvSignInClicked');
    this.router.navigate(['/tv']);
  }

  async logout() {
    this.logoutRef.close();
    this.logDropdownEvent("logOutConfirmClicked");
    // wait for countly to send the req before deleting the session
    await new Promise((r) => setTimeout(r, 500));
    this.messagingService.removeToken();
    this.restService.deleteSession(this.authService.sessionKey).subscribe();
    this.authService.loggedOutByUser = true;
    this.authService.logout();
  }
  LogoutAlert(container) {
    this.logDropdownEvent("logOutClicked");
    this.logoutRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
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
      if (response.isConfirmed) {
        if (error.data.primary_CTA === "Login") 
          this.router.navigate(['/login']);
        else if (error.data.primary_CTA === "Request") {
          if (this.emailOTP) {
            if (this.isVerify) {
              this.resendEmailUpdate();
            } else {
              this.resendUpdateEmail();
            }
          } else {
            if (this.isPhone) {
              this.resendPhoneUpdate();
            } else {
              this.resendUpdatePhone();
            }
          }
        }
      }
    })
  }
}
