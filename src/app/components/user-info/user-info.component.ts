import { Component } from '@angular/core';
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

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
}
