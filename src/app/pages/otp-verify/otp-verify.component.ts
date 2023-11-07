import { Component, ViewChildren, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestService } from 'src/app/services/rest.service';
import Swal from "sweetalert2";

@Component({
  selector: 'app-otp-verify',
  templateUrl: './otp-verify.component.html',
  styleUrls: ['./otp-verify.component.scss']
})
export class OtpVerifyComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  form: UntypedFormGroup;
  display: any;
  senderMobileNumber: string = null;

  formInput = ["one", "two", "three", "four", "five", "six"];
  @ViewChildren("formRow") rows: any;

  public codeForm = new UntypedFormGroup({
    one: new UntypedFormControl("", [Validators.required]),
    two: new UntypedFormControl("", [Validators.required]),
    three: new UntypedFormControl("", [Validators.required]),
    four: new UntypedFormControl("", [Validators.required]),
    five: new UntypedFormControl("", [Validators.required]),
    six: new UntypedFormControl("", [Validators.required]),
  });

  ngOnInit() {
    this.timer();
    this.activatedRoute.queryParams.subscribe((qParm: any) => {
      this.senderMobileNumber = qParm.mobile;
    })
  }

  jump(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(input.value)) {

      if (
        input.value.length === input.maxLength
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

  timer(minutes: number = 1) {
    let seconds: any = minutes * 60;
    const timer = setInterval(() => {
      seconds--;
      const prefix = seconds < 10 ? "0" : "";
      this.display = `${prefix}${seconds}`;
      if (seconds == 0) {
        clearInterval(timer);
      }
    }, 1000);
  }

  verifyOTP() {
    const c = Object.values(
      this.codeForm.value as { [key: string]: string }
    ).map((el) => `${el}`);
    const code = c[0] + c[1] + c[2] + c[3] + c[4] + c[5];

    this.restService.verifyOTPForMobile(this.senderMobileNumber, code).subscribe({
      next: (response: any) => {
        this.router.navigate([`/reset-password/${response.token}`]);
      }, error: (error: any) => {
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    })
  }

  resendOTP() {

  }
}
