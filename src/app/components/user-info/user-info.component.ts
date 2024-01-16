import { Component } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent {

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
}
