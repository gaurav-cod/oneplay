import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { RestService } from 'src/app/services/rest.service';
import { phoneValidator } from 'src/app/utils/validators.util';
import { contryCodeCurrencyMapping } from 'src/app/variables/country-code';
import { v4 } from "uuid";
import { CountlyService } from 'src/app/services/countly.service';
import { AuthService } from 'src/app/services/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-authenticate-user',
  templateUrl: './authenticate-user.component.html',
  styleUrls: ['./authenticate-user.component.scss']
})
export class AuthenticateUserComponent implements OnInit, OnDestroy {

  private _referralModal: NgbModalRef; 
  private _qParamSubscription: Subscription;
  private _timerRef: NodeJS.Timer;

  screenOnDisplay: "REGISTER_LOGIN" | "OTP" = "REGISTER_LOGIN";
  errorMessage: string | null = null;
  @ViewChild("ContactUs") contactUs: ElementRef<HTMLDialogElement>;

  otpTimer: number = 60;

  constructor(
    private readonly ngbModal: NgbModal,
    private readonly restService: RestService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly countlyService: CountlyService,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  private _isPasswordFlow: boolean = false;
  private _doesUserhavePassword: boolean = false;
  private referralName: string | null = null;
  private redirectURL: string | null = null;
  private readonly idempotentKey: string = v4();
  public  isUserRegisted: boolean = false;
  resendOTPClicked: boolean = false;
  isReferralAdded: boolean = false;

  formInput = ["one", "two", "three", "four"];
  @ViewChildren("formRow") rows: any;
  public otpForm = new UntypedFormGroup({
    one: new UntypedFormControl("", [Validators.required]),
    two: new UntypedFormControl("", [Validators.required]),
    three: new UntypedFormControl("", [Validators.required]),
    four: new UntypedFormControl("", [Validators.required])
  });

  mobile: string | null = null;
  isValidPhoneNumber: boolean = false;

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
    return control.touched && control.invalid && control.dirty;
  }
  get countryCodes() {
    return Object.values(contryCodeCurrencyMapping);
  }
  get referralErrored() {
    const control = this.referal_code;
    return !this.referralName && control.dirty && control.touched && control.value?.length > 0;
  }
  
  get passwordErrored() {
    const control = this.authenticateForm.controls["password"];
    return (control.value.length > 0 ? control.touched && control.invalid : true);
  }
  get showPasswordBtn() {
    return this.authenticateForm.controls["password"].value?.length > 0;
  }

  get loginPasswordErrored() {
    return this.phoneErrored || this.passwordErrored;
  }

  ngOnInit() {

    this.referal_code.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged() 
    ).subscribe((id) => this.getUserByReferalCode(id));
    this.authenticateForm.controls["phone"].valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged() 
    ).subscribe((phone)=> this.getUserInfoByPhone(String(this.authenticateForm.controls['country_code'].value + phone)));

    this._qParamSubscription = this.activatedRoute.queryParams.subscribe((qParam)=> {
      this.redirectURL = qParam["redirectUrl"];
      if (qParam["ref"]) {
        this.getUserByReferalCode(qParam["ref"]);
        this.router.navigate([], {queryParams: {ref: null}});
      }
    })

    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (contryCodeCurrencyMapping[res.currency]) {
          this.authenticateForm.controls['country_code'].setValue(contryCodeCurrencyMapping[res.currency]);
        }
        if (res.hosting) {
          Swal.fire({
            title: "Alert!",
            html: "We've detected you're using a VPN! <br/> This may cause performance issues.",
            imageUrl: "assets/img/error/vpn_icon.svg",
            confirmButtonText: "Okay",
          });
        }
      },
    });
  }
  ngOnDestroy(): void {
    clearInterval(this._timerRef);
    this._qParamSubscription?.unsubscribe();
  }

  private getUserInfoByPhone(phone) {
    this.restService.isPhoneRegistred(phone, "web").subscribe({
      next: (response: any)=> {
        this._doesUserhavePassword = response.has_password;
        this._isPasswordFlow = response.has_password;
        this.isUserRegisted = response.is_registered;
        this.isValidPhoneNumber = true;
      }, error: (error: any)=> {
        this.isValidPhoneNumber = false;
        this._isPasswordFlow = false;
        this.isUserRegisted = false;
        this._doesUserhavePassword = false;
      }
    })
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
    this.isReferralAdded = !!this.referralName;
    this._referralModal?.close();
  }
  getUserByReferalCode(code: string) {
    this.referralName = null;
    this.restService.getReferalName(code).subscribe((response) =>{
        if (response.available)
          this.referralName = response.message;
        else
          this.referralName = null;
      }
    );
  }
  getOTP() {
    const payload = {
      "phone": String(this.authenticateForm.value["country_code"] + this.authenticateForm.controls["phone"].value),
      "device": "web",
      "idempotent_key": this.idempotentKey,
      "referral_code": (this.isUserRegisted ? this.referal_code?.value : null)
    }
    this.restService.getLoginOTP(payload).subscribe({
      next: (response)=> {
        if (response) {
          this.screenOnDisplay = "OTP";
          this.mobile = this.authenticateForm.controls["phone"].value;
          this.displayTimer();
          this.otpForm.controls['four'].valueChanges.subscribe(()=> {
            this.errorMessage = null;
            this.verifyOTP();
          })
        }
      }, error: (error) => {
        this.showError(error);
      }
    })
  }
  resendOTP() {
    const payload = {
      "phone": String(this.authenticateForm.value["country_code"] + this.authenticateForm.controls["phone"].value),
      "device": "web",
      "idempotent_key": this.idempotentKey,
    }
    this.restService.resendOTP(payload).subscribe({
      next: (response) => {
        this.resendOTPClicked = true;
        this.errorMessage = null;
        this.displayTimer();
      }, error: (error) => {
        this.errorMessage = error.message;
      }
    })
  }
  verifyOTP() {
    const controls = this.otpForm.controls;
    const code = controls["one"].value + controls["two"].value + controls["three"].value + controls["four"].value;
    const payload = {
      "phone": String(this.authenticateForm.value["country_code"] + this.authenticateForm.controls["phone"].value),
      "otp": code,
      "device": "web",
      "idempotent_key": this.idempotentKey
    }
    this.restService.verifyOTP(payload).subscribe({
      next: (response) => {
        this.userLoginSetup(response);
        
        if (response.new_user) {
          localStorage.setItem("is_new_user", response.new_user);
          this.authService.setDefaultUsernameGiven(true);
          this.authService.setDefaultUsername(response.profile.username);
        }
        else {
          this.authService.setUserInfoRemindLater(response.update_profile);
          this.authService.setUserLogginFlow(true);
        }

        if (this.redirectURL)
          this.router.navigate([this.redirectURL]);
        else 
          this.router.navigate(['/home']);
      }, error: (error) => {
        if (["invalid otp", "otp entered is invalid"].includes(error.message?.toLowerCase())) {
          this.errorMessage = error.message;
        } else {
          this.userLoginFailure(error);
        }
      }
    })
  }
  loginWithPassword() {
    const payload = {
      "phone": String(this.authenticateForm.value["country_code"] + this.authenticateForm.controls["phone"].value),
      "device": "web",
      "password": this.authenticateForm.controls["password"].value,
    }
    this.restService.loginWithPassword(payload).subscribe({
      next: (response)=> {
        this.userLoginSetup(response);
        this.authService.setUserLogginFlow(true);
        this.authService.setUserInfoRemindLater(response.update_profile);
        this.authService.setDefaultUsername(response.profile.username);
        if (this.redirectURL) {
          this.router.navigate([this.redirectURL]);
        }
        else 
          this.router.navigate(['/home']);
      }, error: (error)=> {
        this.userLoginFailure(error);
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
        this.rows._results[index + 1]?.nativeElement.focus();
      }
    } else {
      input.value = "";
    }
  }

  jumpPrev(event: any, index: number) {
   
    if (event.key === "Backspace" || event.key === "Delete") {
      const input = event.target as HTMLInputElement;
      if (input.value.length === 0 && index > 0 && this.rows._results[index - 1]?.nativeElement) {
        this.rows._results[index - 1].nativeElement.focus();
        this.rows._results[index - 1].nativeElement.value = "";
      }
    }
  }
  private userLoginSetup(response: any) {
    this.countlyService.endEvent("signIn", { result: 'success'});
        this.startSignInEvent();
        this.authService.trigger_speed_test = response.trigger_speed_test;
        const code: string = this.route.snapshot.queryParams["code"];
        if (!!code && /\d{4}-\d{4}/.exec(code)) {
          this.restService.setQRSession(code, response.session_token).subscribe({
            next: ()=>{},
            error: (error)=> {
              this.showError(error);
            }
          });
        }
        this.authService.login(response.session_token);
  }
  private userLoginFailure(error: any) {
    this.countlyService.endEvent("signIn", { result: 'failure' });    
    this.showError(error);
  }
  private displayTimer() {
    this.otpTimer = 60;
    this.timer();
  }
  private timer(minutes: number = 1) {
    let seconds: any = this.otpTimer;
    this._timerRef = setInterval(() => {
      seconds--;
      const prefix = seconds < 10 ? "0" : "";
      this.otpTimer = Number(`${prefix}${seconds}`);
      if (seconds == 0) {
        clearInterval(this._timerRef);
      }
    }, 1000);
  }
  
  changeScreen(screenOnDisplay: "REGISTER_LOGIN" | "OTP") {
    this.screenOnDisplay = screenOnDisplay;
    this._doesUserhavePassword = false;
    this.isUserRegisted = false;
    this.referal_code = null;
  }
  private startSignInEvent() {
    this.countlyService.startEvent("signIn", { discardOldData: false });
    const segments = this.countlyService.getEventData("signIn");
    if (!segments.signInFromPage) {
      this.countlyService.updateEventData("signIn", {
        signInFromPage: "directLink",
      })
    }
  }

  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    }).then((response)=> {
      if (response.isConfirmed && (error.data.primary_CTA?.includes("Contact"))) {
        this.contactUs?.nativeElement.click();
      }
    })
  }
}
