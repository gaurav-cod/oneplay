import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  NgbActiveModal,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { Subscription, debounceTime, distinctUntilChanged } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import { CustomDateParserFormatter } from "src/app/utils/dateparse.util";

enum SCREEN_TYPE {
  "DOB" = "DOB",
  "PASSWORD" = "PASSWORD",
  "USERNAME" = "USERNAME",
  "FULLNAME" = "FULLNAME",
}

@Component({
  selector: "app-user-info",
  templateUrl: "./user-info.component.html",
  styleUrls: ["./user-info.component.scss"],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }]
})
export class UserInfoComponent implements OnInit, OnDestroy {
  errorMessage: string | null = null;

  showSuccessMessage: boolean = false;
  atleastOneFieldUpdated: boolean = false;

  private isPasswordAvailable: boolean = false;

  private userSub: Subscription;
  private confirmPassSub: Subscription;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly restService: RestService,
    private readonly countlyService: CountlyService,
    private readonly authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    localStorage.removeItem("showUserInfoModal");

    this.restService.getProfile().toPromise().then((response) => {
      const controls = this.userInfo.controls;
      if (response.dob) {
        controls["dob"].setValue(this.dateToNgbDate(new Date(response.dob)));
      }
      if (response.firstName) {
        controls["fullname"].setValue(response.firstName + response.lastName);
      }
      if (response.username) {
        controls["username"].setValue(response.username);
      }
      this.isPasswordAvailable = response?.hasPassword;
    });

    this.confirmPassSub = this.userInfo.controls["confirmPassword"].valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(
        (data) =>
        (this.errorMessage =
          data != this.userInfo.controls["password"].value
            ? "Password does not match"
            : null)
      );

    this.countlyService.startEvent("detailsPopUp");
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.confirmPassSub?.unsubscribe();
    this.userInfo.reset();
    this.countlyService.endEvent("detailsPopUp");
    this.errorMessage = null;
    this.showSuccessMessage = false;
    this.atleastOneFieldUpdated = false;
  }

  get fullNameErrored() {
    const controls = this.userInfo.controls["fullname"];
    return controls.value?.length > 255;
  }
  get passwordErrored() {
    const control = this.userInfo.controls["password"];
    return control.touched && control.invalid;
  }

  userInfo = new UntypedFormGroup({
    dob: new FormControl(undefined, [Validators.required]),
    username: new FormControl(undefined),
    password: new FormControl(undefined, [
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    ]),
    fullname: new FormControl(undefined),
    confirmPassword: new FormControl(undefined),
  });
  private dateToNgbDate = (date: Date): NgbDateStruct => ({
    year: date.getUTCFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });

  private dateMinusYears = (date: Date, count: number): Date => {
    date.setUTCFullYear(date.getUTCFullYear() - count);
    return date;
  };

  private countlyKey = (key: string) => {
    const keys = {
      "DOB": "dateOfBirth", 
      "PASSWORD": "password", 
      "USERNAME": "username", 
      "FULLNAME": "fullname"
    }
    return keys[key];
  }
  
  minDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 100));
  maxDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 13));
  get dateOfBirthErrored() {
    const control = this.userInfo.controls["dob"];
    return (control.touched || control.dirty) && control.invalid;
  }

  get isButtonDisabled() {
    const control =
      this.userInfo.controls[String(this.screenType).toLowerCase()];
    let isInValid = false;
    if (this.screenType == "PASSWORD") {
      const control_1 = this.userInfo.controls["confirmPassword"];
      isInValid =
        ((control_1.touched || control_1.dirty) && control_1.invalid) ||
        !control_1.value ||
        control.value != control_1.value;
    }
    return (
      ((control.touched || control.dirty) && control.invalid) ||
      !control.value ||
      isInValid
    );
  }

  screenType: SCREEN_TYPE = SCREEN_TYPE.DOB;
  screenList = ["DOB", "PASSWORD", "USERNAME", "FULLNAME"];
  getNextPage() {
    return {
      DOB: "PASSWORD",
      PASSWORD: "USERNAME",
      USERNAME: "FULLNAME",
    };
  }

  remindLater() {
    this.restService.setRemindLater().subscribe((response)=> {
      this.close();
      this.countlyEvent(this.screenType, "later");
    })
  }
  async deleteRemindLater() {
    await this.restService.delteRemindLater().toPromise();
  }

  saveChanges(): void {

    const body: any = {};
    if (!!this.userInfo.controls["username"].value) {
      body.username = this.userInfo.controls["username"].value;
    }
    if (!!this.userInfo.controls["fullname"].value) {
      const [first_name, ...rest] = this.userInfo.controls["fullname"].value
        .trim()
        .split(" ");
      const last_name = rest.join(" ") || "";
      body.first_name = first_name;
      if (!!last_name) {
        body.last_name = last_name;
      } else {
        body.last_name = "";
      }
    }

    if (!!this.userInfo.controls["dob"].value) {
      const year = this.userInfo.controls["dob"].value["year"];
      const month =
        this.userInfo.controls["dob"].value["month"] < 10
          ? "0" + this.userInfo.controls["dob"].value["month"]
          : this.userInfo.controls["dob"].value["month"];
      const day =
        this.userInfo.controls["dob"].value["day"] < 10
          ? "0" + this.userInfo.controls["dob"].value["day"]
          : this.userInfo.controls["dob"].value["day"];
      body.dob = `${year}-${month}-${day}`;
    }
    this.restService.updateProfile(body).subscribe(
      (data) => {
        this.countlyEvent(this.countlyKey(this.screenType), "success");
        this.goToNext();

        if (this.screenType == "USERNAME" && !this.isPasswordAvailable) {
          this.updatePassword();
        }

        this.atleastOneFieldUpdated = true;
        this.authService.updateProfile({
          username: body.username,
          firstName: body.first_name,
          lastName: body.last_name,
          dob: body.dob,
        });
      },
      (error) => {
        this.errorMessage = error.message;
      }
    );
  }

  updatePassword() {
    this.restService
      .createPassword(this.userInfo.controls["password"].value)
      .subscribe(
        (response) => {
          this.authService.updateProfile({
            hasPassword: this.screenType === "USERNAME",
          });
          this.errorMessage = null;
        },
        (error: any) => {
          this.errorMessage = error.message;
        }
      );
  }
  enterUserName(event) {
    this.errorMessage =
      event.target?.value?.length > 16
        ? "username must be shorter than or equal to 16 characters"
        : null;
  }

  goToNext(isSkipped: boolean = false) {
    this.errorMessage = null;

    if (isSkipped) {
      this.countlyEvent(this.screenType, "skip");
    }

    if (this.screenType == SCREEN_TYPE.FULLNAME) {
      if (this.atleastOneFieldUpdated) {
        this.showSuccessMessage = true;
      } else {
        this.close();
      }
    } else {
      this.screenType = this.getNextPage()[this.screenType] as SCREEN_TYPE;
      if (this.isPasswordAvailable && this.screenType == "PASSWORD")
        this.screenType = this.getNextPage()[this.screenType] as SCREEN_TYPE;
    }
  }
  close(removeRemindLater: boolean = false) {

    if (removeRemindLater) {
      this.deleteRemindLater();
    }
    if (!localStorage.getItem("canShowProfileOverlay")) {
      localStorage.setItem("canShowProfileOverlay", "true");
      setTimeout(() => {
        this.authService.setProfileOverlay(true);
      }, 2000);
    }
    this.countlyEvent(this.screenType, "close");
    this.activeModal?.close();
  }

  private countlyEvent(key: string, value: string) {
    this.countlyService.updateEventData("detailsPopUp", { [key]: value });
  }
}
