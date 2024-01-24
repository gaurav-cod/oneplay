import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UpdateProfileDTO } from 'src/app/interface';
import { AuthService } from 'src/app/services/auth.service';
import { RestService } from 'src/app/services/rest.service';

enum SCREEN_TYPE {
  "DOB" = "DOB", "PASSWORD" = "PASSWORD", "USERNAME" = "USERNAME", "FULLNAME" = "FULLNAME"
}

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {
  errorMessage: string | null = null;

  showSuccessMessage: boolean = false;
  atleastOneFieldUpdated: boolean = false;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {}
  async ngOnInit(): Promise<void> {
   
    // const response = await this.restService.getProfile().toPromise();
    // const controls = this.userInfo.controls;
    // if (response.dob) {
    //   controls["dob"].setValue(this.dateToNgbDate(new Date(response.dob)));
    //   this.screenType = SCREEN_TYPE.FULLNAME;
    // } 
    // if (response.firstName) {
    //   controls["fullname"].setValue(response.firstName + response.lastName);
    //   this.screenType = SCREEN_TYPE.PASSWORD;
    // }

    this.userInfo.controls["confirmPassword"].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged() 
    ).subscribe((data) => this.errorMessage = (data != this.userInfo.controls["password"].value ? "Password does not match" : null));
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
    password: new FormControl(undefined,[
      Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)
    ]),
    fullname: new FormControl(undefined),
    confirmPassword: new FormControl(undefined)
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

  
  minDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 100));
  maxDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 13));
  get dateOfBirthErrored() {
    const control = this.userInfo.controls["dob"];
    return (control.touched || control.dirty) && control.invalid;
  }

  get isButtonDisabled() {
    const control = this.userInfo.controls[String(this.screenType).toLowerCase()];
    let   isInValid = false;
    if (this.screenType == "PASSWORD") {
      const control_1 = this.userInfo.controls["confirmPassword"];
      isInValid = ((control_1.touched || control_1.dirty) && control_1.invalid) || !control_1.value || (control.value != control_1.value)
    } 
    return ((control.touched || control.dirty) && control.invalid) || !control.value || isInValid;
  }

  screenType: SCREEN_TYPE = SCREEN_TYPE.DOB;
  screenList = ["DOB", "PASSWORD", "USERNAME", "FULLNAME"];
  getNextPage() {
    return {
      "DOB" : "PASSWORD",
      "PASSWORD" : "USERNAME",
      "USERNAME" : "FULLNAME"
    }
  }

  remindLater() {
    this.restService.setRemindLater().subscribe((response)=> {
      this.activeModal?.close();
    })
  }

  saveChanges(): void {
    
    const body: any = {};
    if (!!this.userInfo.controls["username"].value) {
      body.username = this.userInfo.controls["username"].value;
    }
    if (!!this.userInfo.controls["fullname"].value) {
      const [first_name, ...rest] = this.userInfo.controls["fullname"].value.trim().split(" ");
      const last_name = rest.join(" ") || "";
      body.first_name = first_name;
      if (!!last_name) {
        body.last_name = last_name;
      } else {
        body.last_name = "";
      }
    }
  
    if (!!this.userInfo.controls["dob"].value) {
      const year = this.userInfo.controls["dob"].value['year'];
      const month = this.userInfo.controls["dob"].value['month'] < 10 ? "0" + this.userInfo.controls["dob"].value['month'] : this.userInfo.controls["dob"].value['month'];
      const day = this.userInfo.controls["dob"].value['day'] < 10 ? "0" + this.userInfo.controls["dob"].value['day'] : this.userInfo.controls["dob"].value['day'];
      body.dob = `${year}-${month}-${day}`;
    }
    
    this.restService.updateProfile(body).subscribe(
      (data) => {
        this.goToNext();

        if (this.screenType == "USERNAME") {
          this.authService.setDefaultUsernameGiven(false);
        }

        this.atleastOneFieldUpdated = true;
        this.authService.updateProfile({
          username: body.username,
          firstName: body.first_name,
          lastName: body.last_name,
          dob: body.dob,
          hasPassword: this.screenType == "USERNAME" // if coming from USERNAME then password is added
        });
      },
      (error) => {
        this.errorMessage = error.message;
      }
    );
  }
  enterUserName(event) {
    this.errorMessage = null;
  }

  goToNext(isSkipped: boolean = false) {
    this.errorMessage = null;
    if (this.screenType == SCREEN_TYPE.FULLNAME) {
      this.authService.setProfileOverlay(true);
      if (this.atleastOneFieldUpdated) {
        this.showSuccessMessage = true;
      } else {
        this.close();
      }
    } else {
      this.screenType = this.getNextPage()[this.screenType] as SCREEN_TYPE;
    }
  }
  close() {
    this.activeModal?.close();
  }
}
