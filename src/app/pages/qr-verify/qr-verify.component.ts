import { Component, OnInit, ViewChildren } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-qr-verify",
  templateUrl: "./qr-verify.component.html",
  styleUrls: ["./qr-verify.component.scss"],
})
export class QrVerifyComponent implements OnInit {

  form: FormGroup;
  formInput = ['one', 'two', 'three', 'four', 'indicator', 'five', 'six', 'seven', 'eight'];
  @ViewChildren('formRow') rows: any;

  public loading = false;

  public codeForm = new FormGroup({
    one: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
    two: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
    three: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
    four: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
    five: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
    six: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
    seven: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
    eight: new FormControl("", [Validators.required, Validators.pattern("^[0-9]*$")]),
  });

  private routeSubscription: Subscription;

  constructor(
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
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
  }

  verify() {
    const sessionToken = localStorage.getItem("op_session_token");
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
          });
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            title: "Error Code: " + err.error.code,
            text: err.error.message,
            icon: "error",
          });
        },
      });
    } else {
      console.log(this.codeForm.value);
      // this.router.navigateByUrl("/login?code=" + code);
    }
  }

  keyUpEvent(event, index) {
    if(index > 3) {
      index--
    }
    let pos = index;
    event = (event) ? event : window.event;
    var pattern = /^\d+\.?\d*$/;
    if (event.keyCode === 8 && event.which === 8) {
      pos = index - 1 ;
    } else if(!pattern.test(event.key)) {
      return false;
    }
    else {
      pos = index + 1 ;
    }
    if (pos > -1 && pos < this.formInput.length ) {
      this.rows._results[pos].nativeElement.focus();
    }

  }
}
