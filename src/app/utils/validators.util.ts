import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { CountryCode, parsePhoneNumber } from "libphonenumber-js";

export function phoneValidator(region?: CountryCode, codeField?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    try {
      const fullPhone = (control.parent?.controls[codeField]?.value ?? "") + control.value;
      const phoneNumber = parsePhoneNumber(codeField ? fullPhone : control.value, region);

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
