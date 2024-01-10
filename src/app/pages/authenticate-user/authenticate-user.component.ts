import { Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { phoneValidator } from 'src/app/utils/validators.util';
import { contryCodeCurrencyMapping } from 'src/app/variables/country-code';

@Component({
  selector: 'app-authenticate-user',
  templateUrl: './authenticate-user.component.html',
  styleUrls: ['./authenticate-user.component.scss']
})
export class AuthenticateUserComponent {
  authenticateForm = new UntypedFormGroup({
    country_code: new UntypedFormControl("+91", [Validators.required]),
    phone: new UntypedFormControl("", [
      Validators.required,
      phoneValidator("country_code"),
    ]),
    password: new UntypedFormControl("", Validators.required),
  });

  
  get phoneErrored() {
    const control = this.authenticateForm.controls["phone"];
    return control.touched && control.invalid;
  }
  get countryCodes() {
    return Object.values(contryCodeCurrencyMapping);
  }
  login() {

  }
}
