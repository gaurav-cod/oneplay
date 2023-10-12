import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import isMobilePhoneValidator from "validator/lib/isMobilePhone";

export function phoneValidator(codeField?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    try {
      const fullPhone =
        (control.parent?.controls[codeField]?.value ?? "") + control.value;
      const isValid = isMobilePhoneValidator(
        codeField ? fullPhone : control.value, "any"
      );

      return isValid ? null : { inValidNumber: { value: control.value } };
    } catch (e) {
      return { inValidNumber: { value: control.value } };
    }
  };
}
