import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { phoneValidator } from 'src/app/utils/validators.util';
import { contryCodeCurrencyMapping } from 'src/app/variables/country-code';

@Component({
  selector: 'app-authenticate-user',
  templateUrl: './authenticate-user.component.html',
  styleUrls: ['./authenticate-user.component.scss']
})
export class AuthenticateUserComponent implements OnInit, OnDestroy {

  private _referralModal: NgbModalRef; 

  constructor(
    private readonly ngbModal: NgbModal,
  ) {}

  private _isPasswordFlow: boolean = false;
  private _doesUserhavePassword: boolean = false;

  authenticateForm = new UntypedFormGroup({
    country_code: new UntypedFormControl("+91", [Validators.required]),
    phone: new UntypedFormControl("", [
      Validators.required,
      phoneValidator("country_code"),
    ]),
    password: new UntypedFormControl("", Validators.required),
  });

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

  ngOnInit() {

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
  login() {

  }
}
