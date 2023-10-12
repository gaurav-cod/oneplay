import { AfterViewInit, Component, OnInit, ViewChildren } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import Cookies from "js-cookie";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-qr-verify",
  templateUrl: "./qr-verify.component.html",
  styleUrls: ["./qr-verify.component.scss"],
})
export class QrVerifyComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  formInput = [
    "one",
    "two",
    "three",
    "four",
    "indicator",
    "five",
    "six",
    "seven",
    "eight",
  ];
  @ViewChildren("formRow") rows: any;

  public loading = false;
  public isLoggedIn = false;

  public codeForm = new UntypedFormGroup({
    one: new UntypedFormControl("", [Validators.required]),
    two: new UntypedFormControl("", [Validators.required]),
    three: new UntypedFormControl("", [Validators.required]),
    four: new UntypedFormControl("", [Validators.required]),
    five: new UntypedFormControl("", [Validators.required]),
    six: new UntypedFormControl("", [Validators.required]),
    seven: new UntypedFormControl("", [Validators.required]),
    eight: new UntypedFormControl("", [Validators.required]),
  });

  private routeSubscription: Subscription;
  private loginSubscription: Subscription;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly countlyService: CountlyService
  ) {}

  ngAfterViewInit(): void {
    this.rows._results[0].nativeElement.addEventListener("paste", (e) =>
      this.handlePaste(e)
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.loginSubscription?.unsubscribe();
    this.rows._results[0].nativeElement.removeEventListener("paste", (e) =>
      this.handlePaste(e)
    );
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe({
      next: (params) => {
        const code: string = params["code"];
        if (!!code && /\d{4}-\d{4}/.exec(code)) {
          const [first, second] = code.split("-");
          this.codeForm.setValue({
            one: first[0],
            two: first[1],
            three: first[2],
            four: first[3],
            five: second[0],
            six: second[1],
            seven: second[2],
            eight: second[3],
          });
        }
      },
    });

    this.loginSubscription = this.authService.sessionTokenExists.subscribe(
      (data) => (this.isLoggedIn = data)
    );
  }

  verify() {
    const sessionToken = Cookies.get("op_session_token");
    const c = Object.values(
      this.codeForm.value as { [key: string]: string }
    ).map((el) => `${el}`);
    const code = c[0] + c[1] + c[2] + c[3] + "-" + c[4] + c[5] + c[6] + c[7];

    if (sessionToken) {
      this.loading = true;
      this.restService.setQRSession(code, sessionToken).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            title: "Success",
            text: "You are successfully logged in!",
            icon: "success",
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigateByUrl("/home");
            }
          });
        },
        error: (err) => {
          this.loading = false;
          if (err.error.isOnline)
            Swal.fire({
              title: "Error Code: " + err.error.code,
              text: err.error.message,
              icon: "error",
            });
        },
      });
    } else {
      this.router.navigateByUrl("/login?code=" + code);
    }
  }

  jump(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    if (/^[0-9]$/.test(input.value)) {
      if (index > 3) {
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
    if (index > 3) {
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

  goToSignup() {
    // this.countlyService.addEvent("signUPButtonClick", {
    //   page: location.pathname + location.hash,
    //   trigger: "CTA",
    //   channel: "web",
    // });
    this.router.navigate(["/register"]);
  }

  private handlePaste(event: ClipboardEvent) {
    event.stopPropagation();

    const pastedText = event.clipboardData?.getData("text")?.trim();

    if (/^\d{8}$/.test(pastedText)) {
      const digits = pastedText.split("");
      digits.forEach((digit, i) => {
        Object.values(this.codeForm.controls)[i].setValue(digit);
      })
      this.rows._results[7].nativeElement.focus();
    }
  }
}
