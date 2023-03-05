import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { CountryCode, parsePhoneNumber } from "libphonenumber-js";

export function phoneValidator(region?: CountryCode): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    try {
      const phoneNumber = parsePhoneNumber(control.value, region);

      if (region && phoneNumber.country !== region) {
        return { inValidCountry: { value: control.value } };
      }

      return phoneNumber.isValid()
        ? null
        : { inValidNumber: { value: control.value } };
    } catch (e) {
      return { inValidNumber: { value: control.value } };
    }
  };
}
