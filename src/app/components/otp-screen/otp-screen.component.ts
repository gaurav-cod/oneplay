import { Component, EventEmitter, Input, Output, ViewChildren } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-otp-screen',
  templateUrl: './otp-screen.component.html',
  styleUrls: ['./otp-screen.component.scss']
})
export class OtpScreenComponent {
  @Input() otpHeading: string;
  @Input() otpSubHeading: string;
  @Input() buttonText: string;
  @Input() inputValue: string;
  @Input() remainingTimer: boolean;
  @Input() display: any;
  @Input() errorMessage: string;

  @Output() verfiyEmail = new EventEmitter<string>();
  @Output() resendUpdateEmail = new EventEmitter();

  form: UntypedFormGroup;
  formInput = [
    "one",
    "two",
    "three",
    "indicator",
    "four",
    "five",
    "six",
  ];
  @ViewChildren("formRow") rows: any;
  public codeForm = new UntypedFormGroup({
    one: new UntypedFormControl("", [Validators.required]),
    two: new UntypedFormControl("", [Validators.required]),
    three: new UntypedFormControl("", [Validators.required]),
    four: new UntypedFormControl("", [Validators.required]),
    five: new UntypedFormControl("", [Validators.required]),
    six: new UntypedFormControl("", [Validators.required]),
  });

  constructor(
  ){}

  onResend() {
    this.resendUpdateEmail.emit();
  }

  onConfirm() {
    const c = Object.values(
      this.codeForm.value as { [key: string]: string }
    ).map((el) => `${el}`);
    const code = c[0] + c[1] + c[2] + c[3] + c[4] + c[5];
    this.verfiyEmail.emit(code);
  }

  jump(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(input.value)) {
      if (index > 2) {
        index--;
      }
      if (
        input.value.length === input.maxLength &&
        index < this.formInput.length - 2
      ) {
        this.rows._results[index + 1].nativeElement.focus();
      }
    } else {
      input.value = "";
    }
  }

  jumpPrev(event: any, index: number) {
    if (index > 2) {
      index--;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      const input = event.target as HTMLInputElement;
      if (input.value.length === 0 && index > 0) {
        this.rows._results[index - 1].nativeElement.focus();
        this.rows._results[index - 1].nativeElement.value = "";
      }
    }
  }
}
