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
  userInfoComponentInstance: UserInfoComponent;
  errorMessage: string | null = null;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {}
  ngOnInit(): void {
    // this.authService.user.toPromise().then((data)=> {
    //   this.userInfo.controls["username"].setValue(data.username);
    // })
    this.userInfo.controls["confirmPassword"].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged() 
    ).subscribe((data) => this.errorMessage = (data != this.userInfo.controls["password"].value ? "Password & Confirm Password do not match" : null));
  }

  get fullNameErrored() {
    const controls = this.userInfo.controls["fullname"];
    return controls.value?.length > 5;
  }

  userInfo = new UntypedFormGroup({
    dob: new FormControl(undefined, [Validators.required]),
    username: new FormControl(undefined),
    password: new FormControl(undefined),
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
    return ((control.touched || control.dirty) && control.invalid) || !control.value;
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
        this.authService.updateProfile({
          username: body.username,
          firstName: body.first_name,
          lastName: body.last_name,
          dob: body.dob
        });
      },
      (error) => {
        this.errorMessage = error.message;
      }
    );
  }

  goToNext() {
    this.errorMessage = null;
    if (this.screenType == SCREEN_TYPE.FULLNAME) {
      this.authService.setProfileOverlay(true);
      this.activeModal?.close();
    } else {
      this.screenType = this.getNextPage()[this.screenType] as SCREEN_TYPE;
    }
  }
  close() {
    this.activeModal?.close();
  }
}
