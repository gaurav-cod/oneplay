import { Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RestService } from 'src/app/services/rest.service';
import { phoneValidator } from 'src/app/utils/validators.util';
import { contryCodeCurrencyMapping } from 'src/app/variables/country-code';

@Component({
  selector: 'app-authenticate-user',
  templateUrl: './authenticate-user.component.html',
  styleUrls: ['./authenticate-user.component.scss']
})
export class AuthenticateUserComponent implements OnInit, OnDestroy {

  private _referralModal: NgbModalRef; 
  screenOnDisplay: "REGISTER_LOGIN" | "OTP" = "OTP";
  errorMessage: string | null = null;

  constructor(
    private readonly ngbModal: NgbModal,
    private readonly restService: RestService,
    private readonly router: Router
  ) {}

  private _isPasswordFlow: boolean = false;
  private _doesUserhavePassword: boolean = false;
  private referralName: string | null = null;

  formInput = ["one", "two", "three", "four"];
  @ViewChildren("formRow") rows: any;
  public otpForm = new UntypedFormGroup({
    one: new UntypedFormControl("", [Validators.required]),
    two: new UntypedFormControl("", [Validators.required]),
    three: new UntypedFormControl("", [Validators.required]),
    four: new UntypedFormControl("", [Validators.required])
  });

  mobile: string | null = null;

  authenticateForm = new UntypedFormGroup({
    country_code: new UntypedFormControl("+91", [Validators.required]),
    phone: new UntypedFormControl("", [
      Validators.required,
      phoneValidator("country_code"),
    ]),
    password: new UntypedFormControl("", Validators.required),
  });
  referal_code = new UntypedFormControl("")

  get allowPasswordInput() {
    return this._isPasswordFlow && this._doesUserhavePassword;
  }
  
  get phoneErrored() {
    const control = this.authenticateForm.controls["phone"];
    return control.touched && control.invalid;
  }
  get countryCodes() {
    return Object.values(contryCodeCurrencyMapping);
  }
  get referralErrored() {
    const control = this.referal_code;
    return !this.referralName && control.dirty && control.touched && control.value?.length > 0;
  }
  get referralErroredBtn() {
    const control = this.referal_code;
    return (!this.referralName && control.dirty && control.touched) || control.value?.length == 0;
  }

  ngOnInit() {
    this.referal_code.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged() 
    ).subscribe((id) => this.getUserByReferalCode(id));
    this.authenticateForm.controls["phone"].valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged() 
    ).subscribe((phone)=> this.mobile = phone)
  }
  ngOnDestroy(): void {
    
  }

  openReferralModal(container: ElementRef<HTMLDivElement>) {
    this._referralModal = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }
  closeReferralDialog() {
    this._referralModal?.close();
  }
  getUserByReferalCode(code: string) {
    this.referralName = null;
    this.restService.getName(code).subscribe(
      (name) => (this.referralName = name)
    );
  }
  getOTP() {
    const payload = {
      "phone": this.authenticateForm["phone"].value,
      "device": "web",
      "idempotent_key": "uuid",
      "referral_code": this.referal_code.value
    }
    this.restService.getLoginOTP(payload).subscribe({
      next: (response)=> {
        if (response) {
          
        }
      }, error: (error) => {

      }
    })
  }
  verifyOTP() {
    const controls = this.otpForm.controls;
    const code = controls["one"].value + controls["two"].value + controls["three"].value + controls["four"].value;
    const payload = {
      "phone": this.authenticateForm["phone"].value,
      "otp": code,
      "device": "web",
      "idempotent_key": "uuid"
    }
    this.restService.verifyOTP(payload).subscribe({
      next: (response) => {
      }, error: () => {

      }
    })
  }
  jump(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(input.value)) {
      if (
        input.value.length === input.maxLength &&
        index < this.formInput.length
      ) {
        this.rows._results[index + 1].nativeElement.focus();
      }
    } else {
      input.value = "";
    }
  }

  jumpPrev(event: any, index: number) {
   
    if (event.key === "Backspace" || event.key === "Delete") {
      const input = event.target as HTMLInputElement;
      if (input.value.length === 0 && index > 0) {
        this.rows._results[index - 1].nativeElement.focus();
        this.rows._results[index - 1].nativeElement.value = "";
      }
    }
  }
  login() {

  }
}
