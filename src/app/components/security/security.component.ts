import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { phoneValidator } from "src/app/utils/validators.util";
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

  @Input() codeForm;

  otpHeading: string = '';
  otpSubHeading: string = '';
  buttonText: string = 'Continue';
  
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  email = new UntypedFormControl("", [Validators.required, Validators.pattern(this.emailPattern)]);

  password = new UntypedFormControl("", [
    Validators.required,
    Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
  ]);
  phone = new UntypedFormControl("", [Validators.required, phoneValidator()]);
  
  showPass = false;

  private user: UserModel;
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
      this.phone.setValue(user.phone);
      this.email.setValue(user.email);
    });
  }

  ngOnInit(): void {}

  openPhoneModal() {
    this._changePhoneModalRef = this.ngbModal.open(this.changePhoneModal, {
      centered: true,
      modalDialogClass: "modal-sm",
      scrollable: true,
      backdrop: "static",
      keyboard: false,
    });
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

  updatePhone(): void {
    if (!this.phone.valid) return;
    this.phone.disable();
    if (this.user.phone === this.phone.value.trim()) return;
    this.restService.updateProfile({ phone: this.phone.value }).subscribe(
      () => {
        this.authService.updateProfile({ phone: this.phone.value });
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully updated phone number.",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }

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
    if (this.email.invalid) return;
    if (this.user.email === this.email.value.trim()) return;
    this.restService.updateEmail(this.email.value).subscribe(
      () => {
        this.otpHeading = "Enter Security Code";
        this.otpSubHeading = "A security code has been sent to your mobile number and previous email address.";
        this.openOTPScreen();
      }
    );
  }

  verfiyEmail() {
    const c = Object.values(
      this.codeForm.value as { [key: string]: string }
    ).map((el) => `${el}`);
    const code = c[0] + c[1] + c[2] + "-" + c[3] + c[4] + c[5];
    this.restService.verifyEmailUpdate(code).subscribe(
      () => {
        this._otpScreenRef?.close();
        this.otpHeading = "Verify New Email Address";
        this.otpSubHeading = "Please enter the code sent to your new email address.";
        this.buttonText = "Confirm";
        this.openOTPScreen();
      }
    );
  }

  confirmEmail() {
    const c = Object.values(
      this.codeForm.value as { [key: string]: string }
    ).map((el) => `${el}`);
    const code = c[0] + c[1] + c[2] + "-" + c[3] + c[4] + c[5];
    this.restService.confirmEmailUpdate(code).subscribe(
      () => {
        Swal.fire({
          icon: "success",
          text: "You have successfully changed your email.",
        });
        this.authService.logout();
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

  updatePassword(): void {
    this.restService.updatePassword(this.password.value).subscribe(
      () => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password updated successfully",
        });
        this.password.reset();
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }
}
