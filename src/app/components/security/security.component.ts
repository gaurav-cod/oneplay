import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-security",
  templateUrl: "./security.component.html",
  styleUrls: ["./security.component.scss"],
})
export class SecurityComponent implements OnInit {
  @ViewChild("changeEmailModal") changeEmailModal: ElementRef<HTMLDivElement>;
  @ViewChild("changePhoneModal") changePhoneModal: ElementRef<HTMLDivElement>;
  @ViewChild("changePasswordModal") changePasswordModal: ElementRef<HTMLDivElement>;
  @ViewChild("otpScreen") otpScreen: ElementRef<HTMLDivElement>;

  buttonText: string = 'Continue';
  isVerify: boolean = true;
  isPhone: boolean = true;
  emailOTP: boolean = true;
  remainingTimer = false;
  display: any;
  sameEmail: boolean = false;
  existingAccount: string;

  isDisabled: boolean = true;

  errorMessage: string;
  incorrectCode: string;
  
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  // email = new UntypedFormControl("", [Validators.required, Validators.pattern(this.emailPattern)]);
  // country_code = new UntypedFormControl("+91", [Validators.required]);
  

  // password = new UntypedFormControl("", [
  //   Validators.required,
  //   Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  // ]);

  updateSecurity = new UntypedFormGroup({
    email: new UntypedFormControl("", [Validators.required, Validators.pattern(this.emailPattern)]),
    country_code: new UntypedFormControl("+91", [Validators.required]),
    phone: new UntypedFormControl("", [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
    oldPassword: new UntypedFormControl("",  [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)]),
    password: new UntypedFormControl("", [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)]),
    confirmPassword: new UntypedFormControl("",  [Validators.required]),
  });

  // oldPassword = new UntypedFormControl("", [
  //   Validators.required,
  // ]);
  // confirmPassword = new UntypedFormControl("",  [Validators.required]);
  // phone = new UntypedFormControl("", [Validators.required, phoneValidator()]);

  readonly countryCodes = [
    "+91",
    "+850",
    "+82",
    "+84",
    "+7",
    "+1",
    "+60",
    "+98",
    "+971",
  ];
  
  showPass = false;

  user: UserModel;
  private _changeEmailModalRef: NgbModalRef;
  private _changePhoneModalRef: NgbModalRef;
  private _changePasswordModalRef: NgbModalRef;
  private _otpScreenRef: NgbModalRef;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly ngbModal: NgbModal,
  ) {
    this.authService.user.subscribe((user) => {
      this.user = user;
      // this.phone.setValue(user.phone);
      // this.email.setValue(user.email);
    });
  }

  get checkvalidationValue() {
    if(this.updateSecurity.value.oldPassword && this.updateSecurity.value.password.length && this.updateSecurity.value.password === this.updateSecurity.value.confirmPassword) {
      return false;
    } else {
      return true;
    }
  }

  get oldPasswordErrored() {
    const control = this.updateSecurity.controls["oldPassword"];
    return control.touched && control.invalid;
  }

  get phoneErrored() {
    const control = this.updateSecurity.controls["phone"];
    return control.touched && control.invalid;
  }

  get emailErrored() {
    const control = this.updateSecurity.controls["email"];
    return control.touched && control.invalid;
  }

  get passwordErrored() {
    const control = this.updateSecurity.controls["password"];
    return control.touched && control.invalid;
  }

  get passwordSameErrored() {
    const control = this.updateSecurity.controls["password"];
    if(!control.invalid) {
      if(this.updateSecurity.value.oldPassword === this.updateSecurity.value.password) {
        return control.touched && true;
      } else {
        return control.touched && false;
      }
    }
    
  }

  get confirmPasswordErrored() {
    const control = this.updateSecurity.controls["confirmPassword"];
    if(this.updateSecurity.value.password !== this.updateSecurity.value.confirmPassword) {
      return control.touched && true;
    } else {
      return control.touched && false;
    }
  }

  ngOnInit(): void {}

  closePopUp() {
    this._otpScreenRef.close();
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

  openEmailModal() {
    this._changeEmailModalRef = this.ngbModal.open(this.changeEmailModal, {
      centered: true,
      modalDialogClass: "modal-sm",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  updateEmail(): void {
    if (this.emailErrored) return;
    if (this.user?.email === this.updateSecurity.value?.email.trim()) return;
    this.restService.updateEmail(this.updateSecurity.value.email.value).subscribe(
      () => {
        this._changeEmailModalRef.close();
        this.timer(1)
        this.openOTPScreen();
      },
      (error) => {
        this.existingAccount = error.message
      }
    );
  }

  resendEmailUpdate() {
    this.restService.resendEmailRequestUpdate().subscribe(
      ()=>{
        this.timer(1)
      },
      (error) => {
        if(error.code === 429) {
          this.errorMessage = error.message;
        }
      }
    );
  }
  
  resendUpdateEmail() {
    this.restService.resendUpdateEmail().subscribe(
      ()=>{
        this.timer(1)
      },
      (error) => {
        if(error.code === 429) {
          this.errorMessage = error.message
        } else {
          this.incorrectCode = error.message;
        }
      }
    );
  }

  verfiyEmail(data: string) {
    this.restService.verifyEmailUpdate(data).subscribe(
      () => {
        this._otpScreenRef.close();
        this.isVerify = false;
        this.buttonText = 'Confirm';
        this.openOTPScreen();
      },
      (error) => {
        this.incorrectCode = error.message;
      }
    );
  }

  confirmEmail(data: string) {
    this.restService.confirmEmailUpdate(data).subscribe(
      () => {
        this._otpScreenRef.close();
        Swal.fire({
          icon: "success",
          text: "You have successfully changed your email.",
        });
        this.authService.logout();
      },
      (error) => {
        this.incorrectCode = error.message;
      }
    );
  }

  openPhoneModal() {
    this._changePhoneModalRef = this.ngbModal.open(this.changePhoneModal, {
      centered: true,
      modalDialogClass: "modal-sm",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (this.countryCodes.includes(res.country_calling_code)) {
          this.updateSecurity.controls["country_code"].setValue(
            res.country_calling_code
          );
        }
      },
    });
  }

  updatePhone(): void {
    if (this.phoneErrored) return;
    if (this.user.phone === this.updateSecurity.value.phone.trim()) return ;
    this.restService.updatePhone(this.updateSecurity.value.country_code + this.updateSecurity.value.phone).subscribe(
      () => {
        this._changePhoneModalRef.close();
        this.emailOTP = false;
        this.timer(1);
        this.openOTPScreen();
      },
      (error) => {
        this.existingAccount = error.message
      }
    );
  }

  resendPhoneUpdate() {
    this.restService.resendPhoneRequestUpdate().subscribe(
      ()=>{
        this.timer(1)
      },
      (error) => {
        if(error.code === 429) {
          this.errorMessage = error.message
        }
      }
    );
  }
  
  resendUpdatePhone() {
    this.restService.resendPhoneUpdate().subscribe(
      ()=>{
        this.timer(1)
      },
      (error) => {
        if(error.code === 429) {
          this.errorMessage = error.message
        }
      }
    );
  }

  verfiyPhone(data: string) {
    this.restService.verifyPhoneUpdate(data).subscribe(
      () => {
        this._otpScreenRef.close();
        this.isPhone = false;
        this.buttonText = 'Confirm';
        this.openOTPScreen();
      },
      (error) => {
        this.incorrectCode = error.message;
      }
    );
  }

  confirmPhone(data: string) {
    this.restService.confirmPhoneUpdate(data).subscribe(
      () => {
        this._otpScreenRef.close();
        Swal.fire({
          icon: "success",
          text: "You have successfully changed your phone number.",
        });
        this.authService.logout();
      },
      (error) => {
        this.incorrectCode = error.message;
      }
    );
  }

  openPasswordModal() {
    this._changePasswordModalRef = this.ngbModal.open(this.changePasswordModal, {
      centered: true,
      modalDialogClass: "modal-md",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  // updatePhone(): void {
  //   if (!this.phone.valid) return;
  //   this.phone.disable();
  //   if (this.user.phone === this.phone.value.trim()) return;
  //   this.restService.updateProfile({ phone: this.phone.value }).subscribe(
  //     () => {
  //       this.authService.updateProfile({ phone: this.phone.value });
  //       Swal.fire({
  //         icon: "success",
  //         title: "Success",
  //         text: "Successfully updated phone number.",
  //       });
  //     },
  //     (error) => {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error Code: " + error.code,
  //         text: error.message,
  //       });
  //     }
  //   );
  // }

  // updateEmail(): void {
  //   if (this.email.invalid) return;
  //   this.email.disable();
  //   if (this.user.email === this.email.value.trim()) return;
  //   this.restService.updateEmail(this.email.value).subscribe(
  //     (msg) => {
  //       Swal.fire({
  //         icon: "success",
  //         title: "Success",
  //         text: msg,
  //       });
  //       this.authService.logout();
  //     },
  //     (error) => {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error Code: " + error.code,
  //         text: error.message,
  //       });
  //     }
  //   );
  // }

  updatePassword(): void {
    if(this.checkvalidationValue) return;
    this.restService.updatePassword(this.updateSecurity.value, this.updateSecurity.value.oldPassword).subscribe(
      () => {
        Swal.fire({
          icon: "success",
          title: "Password Changed!",
          text: "You have successfully changed your password.",
        });
        this.updateSecurity.value.password.reset();
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: " Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }
}
