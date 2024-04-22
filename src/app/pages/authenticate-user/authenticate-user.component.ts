import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
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
import { getDefaultSignInSegments } from 'src/app/utils/countly.util';
import { LoginOtpRO, LoginRO } from 'src/app/interface.d';
import { UserModel } from 'src/app/models/user.model';
import { CustomTimedCountlyEvents } from 'src/app/services/countly';
import { environment } from 'src/environments/environment';
import { ReferrerService } from 'src/app/services/referrer.service';

enum PARTNER_CODE {
  BATELCO = "fda35338-ae5d-11ee-af68-023d25f0c398"
}

@Component({
  selector: 'app-authenticate-user',
  templateUrl: './authenticate-user.component.html',
  styleUrls: ['./authenticate-user.component.scss']
})
export class AuthenticateUserComponent implements OnInit, OnDestroy, AfterViewInit {

  private _referralModal: NgbModalRef; 
  private _qParamSubscription: Subscription;
  private _referalSubscription: Subscription;
  private _phoneSubcription: Subscription;
  private _routerParamSubscription: Subscription;

  private _deviceType: "web" | "tizen" = "web";

  public nonFunctionalRegion: boolean = false;

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
    private readonly activatedRoute: ActivatedRoute,
    private readonly referrerService: ReferrerService,
  ) {}

  ngAfterViewInit(): void {
    
  }

  private _isPasswordFlow: boolean = false;
  private _doesUserhavePassword: boolean = false;
  private referralName: string | null = null;
  private redirectURL: string | null = null;
  private readonly idempotentKey: string = v4();
  public  isUserRegisted: boolean = false;
  public  isPartnerReferalCodeAllowed: boolean = false; 
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

  get getCountryCodeWidth() {
     const wordLength = this.authenticateForm.controls['country_code'].value.length;
     return wordLength > 4 && wordLength <=6 ? '100px !important' :  (wordLength > 6 ? '120px !important' : '' )
  }

  get allowPasswordInput() {
    return this._isPasswordFlow && this._doesUserhavePassword;
  }
  
  get phoneErrored() {
    const control = this.authenticateForm.controls["phone"];
    return control.invalid && control.dirty && control.value;
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
    const referrer = this.referrerService.getReferrer();
    if(referrer==="tizen"){
      this._deviceType="tizen";
    }
    const partnerId = this.route.snapshot.queryParams['partner'];
    if (!partnerId) {
      this.restService.getLogInURL().toPromise().then(({ partner_id, referral_allowed }) => {
        environment.partner_id = partner_id;
        localStorage.setItem("x-partner-id", partner_id);
        this.isPartnerReferalCodeAllowed = referral_allowed;
      }).catch((error) => {
        if (error?.error?.code == 307) {
          this.authService.setIsNonFunctionalRegion(true);
        }
      });
    } else {
      environment.partner_id = partnerId;
      localStorage.setItem("x-partner-id", partnerId);
    }

    this.startSignInEvent();

    this.nonFunctionalRegion = this.authService.isNonFunctionalRegion;

    this._referalSubscription = this.referal_code.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged() 
    ).subscribe((id) => this.getUserByReferalCode(id));
    this._phoneSubcription = this.authenticateForm.controls["phone"].valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged() 
    ).subscribe((phone)=> this.getUserInfoByPhone(String(this.authenticateForm.controls['country_code'].value + phone)));

     this._routerParamSubscription = this.route.params.subscribe((param)=> {
      if (!param["device"] || param["device"] != 'tizen') return;
      this._deviceType = "tizen";
    })

    this._qParamSubscription = this.activatedRoute.queryParams.subscribe((qParam)=> {
      this.redirectURL = qParam["redirectUrl"];
      if (qParam["ref"]) {
        this.getUserByReferalCode(qParam["ref"]);
        // this.router.navigate([], {queryParams: {ref: null}});
      } 
      if (qParam["partner"]) {
        environment.partner_id = qParam["partner"] == PARTNER_CODE.BATELCO ? qParam["partner"] : environment.partner_id;
        if (qParam["msisdn"]) {
          const mobile = decodeURIComponent(qParam["msisdn"].trim());
          this.authenticateForm.controls["country_code"].setValue("+" + mobile.substr(0, 3));
          this.authenticateForm.controls["phone"].setValue(mobile.substr(3));
          this.getUserInfoByPhone("+" + mobile, true);
        } 
      }
    })
    this.restService.getCurrentLocation().subscribe({
      next: (res) => {
        if (contryCodeCurrencyMapping[res.countryCode]) {
          this.authenticateForm.controls['country_code'].setValue(contryCodeCurrencyMapping[res.countryCode]);
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
    this.countlyService.endEvent("signIn");
    this._qParamSubscription?.unsubscribe();
    this._phoneSubcription?.unsubscribe();
    this._referalSubscription?.unsubscribe();
    this._routerParamSubscription?.unsubscribe();

    this.rows._results[0]?.nativeElement.removeEventListener("paste", (e) =>
      this.handlePaste(e)
    );
  }

  private getUserInfoByPhone(phone, goToOTPScreen: boolean = false) {
    const control = this.authenticateForm.controls["phone"];
    this.restService.isPhoneRegistred(phone, "web").subscribe({
      next: (response: any)=> {
        control.setErrors(null)
        this._doesUserhavePassword = response.has_password;
        this._isPasswordFlow = response.has_password;
        this.isUserRegisted = response.is_registered;
        this.isValidPhoneNumber = true;

        if (this._isPasswordFlow) {
          this.countlyEvent("passwordRequired", "yes");
        }

        if (goToOTPScreen)
          this.getOTP();

      }, error: (error: any)=> {
        this.isValidPhoneNumber = false;
        this._isPasswordFlow = false;
        this.isUserRegisted = false;
        this._doesUserhavePassword = false;
        control.setErrors({ inValidNumber: { value: control.value } })
      }
    })
  }

  openReferralModal(container: ElementRef<HTMLDivElement>) {
    this.countlyEvent("ReferralIdClicked", "yes");
    this._referralModal = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
      backdrop: "static",
      keyboard: false,
    });
  }
  closeReferralDialog(isReferalAdded: boolean = false) {
    if (!isReferalAdded) {
      this.isReferralAdded = false;
      this.referal_code.setValue("");
      this._referralModal?.close();
      return;
    }
    this.restService.getReferalName(this.referralName).toPromise().then(()=> {
      this.isReferralAdded = !!this.referralName && isReferalAdded;
      this._referralModal?.close();
    })
  }
  getUserByReferalCode(code: string) {
    this.referralName = null;
    this.restService.getReferalName(code).subscribe((response) =>{
        if (response.available) {
          this.referal_code.setValue(code);
          this.referralName = response.message;
        }
        else {
          this.referralName = null;
          this.isReferralAdded = false;
        }
      }
    );
  }
  getOTP() {
   
    if (this._isPasswordFlow) {
      this.countlyEvent("passwordGetOtpClicked", "yes");
    }
    this.countlyEvent("getOtpClicked", "yes");
    this.countlyEvent("ReferralIdEntered", (this.isUserRegisted && this.referal_code?.value) ? "yes" : "no");

    const payload = {
      "phone": String(this.authenticateForm.value["country_code"] + this.authenticateForm.controls["phone"].value),
      "device": this._deviceType == "tizen" ? "tizen" : "web",
      "idempotent_key": this.idempotentKey,
      "referral_code": (!this.isUserRegisted ? this.referal_code?.value : null)
    }
    this.restService.getLoginOTP(payload).subscribe({
      next: (response)=> {
        if (response) {
          this.changeScreen("OTP");
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
      "device": this._deviceType == "tizen" ? "tizen" : "web",
      "idempotent_key": this.idempotentKey,
      "referral_code": (!this.isUserRegisted ? this.referal_code?.value : null)
    }
    this.restService.resendOTP(payload).subscribe({
      next: (response) => {
        this.countlyEvent("resendOtpClicked", "yes");
        this.resendOTPClicked = true;
        this.errorMessage = null;
        this.displayTimer();
      }, error: (error) => {
        this.errorMessage = error.message;
      }
    })
  }
  verifyOTP() {
    this.countlyEvent("otpEntered", "yes");
    const controls = this.otpForm.controls;
    const code = controls["one"].value + controls["two"].value + controls["three"].value + controls["four"].value;

    // if code in not valid don't call API
    if (code.length != 4)
      return;

    const payload = {
      "phone": String(this.authenticateForm.value["country_code"] + this.authenticateForm.controls["phone"].value),
      "otp": code,
      "device": this._deviceType == "tizen" ? "tizen" : "web",
      "idempotent_key": this.idempotentKey
    }
    this.restService.verifyOTP(payload).subscribe({
      next: (response) => {
        this.userLoginSetup(response);
        
        this.countlyEvent("otpEntered", "yes");

        if (response.new_user) {
          localStorage.setItem("is_new_user", String(response.new_user));
          localStorage.setItem("showUserInfoModal", "true");
          localStorage.setItem("showTooltipInfo", "true");
          localStorage.setItem("showAddToLibrary", "true");
          localStorage.removeItem("canShowProfileOverlay");
        }
        else {
          if (response.update_profile)
            localStorage.setItem("showUserInfoModal", "true");
          localStorage.setItem("showWelcomBackMsg", "true");
        }

        if (this.redirectURL)
          this.router.navigate([this.redirectURL]);
        else 
          this.router.navigate(['/home']);
      }, error: (error) => {
        this.countlyEvent("otpFailure", "yes");
        this.errorMessage = error.message;
        if (["invalid otp", "otp entered is invalid"].includes(error.message?.toLowerCase())) {
          this.countlyEvent("otpFailureReson", "invalid");
        } else {

          this.userLoginFailure(error, false);
          this.countlyEvent("otpFailureReson", "expired");
        }
      }
    })
  }
  loginWithPassword() {
    this.countlyEvent("passwordEnterd", "yes");
    const payload = {
      "phone": String(this.authenticateForm.value["country_code"] + this.authenticateForm.controls["phone"].value),
      "device": this._deviceType == "tizen" ? "tizen" : "web",
      "password": this.authenticateForm.controls["password"].value,
    }
    this.restService.loginWithPassword(payload).subscribe({
      next: (response)=> {
        this.userLoginSetup(response);
        localStorage.setItem("showWelcomBackMsg", "true");
        if (response.update_profile)
          localStorage.setItem("showUserInfoModal", "true");
        if (this.redirectURL) {
          this.router.navigate([this.redirectURL]);
        }
        else {
          this.router.navigate(['/home']);
        }
      }, error: (error)=> {
        
        this.countlyEvent("passwordfailed", "yes");
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
  private userLoginSetup(response: LoginRO & {profile: UserModel}) {
    this.countlyService.endEvent("signIn", { result: 'success', phoneNumberEntered: "yes"});
    setTimeout(()=> {
      this.authService.trigger_speed_test = response.trigger_speed_test;
    }, 5000);
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
    this.authService.setUser(response.profile);
  }
  private userLoginFailure(error: any, canShowError: boolean = true) {
    this.countlyService.endEvent("signIn", { result: 'failure', phoneNumberEntered: "yes" });  
    if (canShowError)  
      this.showError(error);
  }
  private displayTimer() {
    this.otpTimer = 60;
    this.timer();
  }
  private timer(minutes: number = 1) {
    let seconds: any = this.otpTimer;
    const timeRef = setInterval(() => {
      seconds--;
      const prefix = seconds < 10 ? "0" : "";
      this.otpTimer = Number(`${prefix}${seconds}`);
      if (seconds == 0 || this.screenOnDisplay == "REGISTER_LOGIN") {
        clearInterval(timeRef);
      }
    }, 1000);
  }
  guestFlow() {
    this.countlyEvent("guestLoginClicked", "yes");
    this.router.navigate(['/home']);
  }
  
  changeScreen(screenOnDisplay: "REGISTER_LOGIN" | "OTP") {

    this.screenOnDisplay = screenOnDisplay;
    this._doesUserhavePassword = false;
    if (this.isUserRegisted && screenOnDisplay == "OTP") {
      this.referal_code = null;
    } else {
      this.isUserRegisted = false;
    }
    this.errorMessage = null;
    if (screenOnDisplay == "REGISTER_LOGIN")
      this.countlyEvent("changePhoneNumber", "yes");
    if (screenOnDisplay === "OTP") {
      // reset otp
      Object.keys(this.otpForm.controls).forEach((key)=> {
        this.otpForm.controls[key].setValue("");
      })
      setTimeout(()=> {

        this.rows._results[0]?.nativeElement.addEventListener("paste", (e) =>
          this.handlePaste(e)
        );
      }, 500);
    } else {
      this.authenticateForm.controls["phone"].setValue("");
      this.errorMessage = null;
      this.rows._results[0]?.nativeElement.removeEventListener("paste", (e) =>
        this.handlePaste(e)
      );
    }
  }

  onKeyPressCheckMobile(event: KeyboardEvent) {
    const charCode = event.charCode;
    const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-_+@';
    if (validChars.includes(String.fromCharCode(charCode)) || event.code == "KeyE") {
      event.preventDefault();
    }
  }

  private handlePaste(event: ClipboardEvent) {
    event.stopPropagation();

    const pastedText = event.clipboardData?.getData("text")?.trim();

    if (/^\d{4}$/.test(pastedText)) {
      const digits = pastedText.split("");
      digits.forEach((digit, i) => {
        Object.values(this.otpForm.controls)[i].setValue(digit);
      })
      this.rows._results[3]?.nativeElement.focus();
    }
  }

  private startSignInEvent() {
    this.countlyService.startEvent("signIn", { discardOldData: false });
    this.countlyService.updateEventData("signIn", getDefaultSignInSegments())
    const segments = this.countlyService.getEventData("signIn");
    if (!segments.signInFromPage) {
      this.countlyService.updateEventData("signIn", {
        signInFromPage: "directLink",
      })
    }
  }

  private countlyEvent(key: keyof CustomTimedCountlyEvents["signIn"], value: string) {
    this.countlyService.endEvent("signIn", { [key]: value});
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
