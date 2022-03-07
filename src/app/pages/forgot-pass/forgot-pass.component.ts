import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.scss']
})
export class ForgotPassComponent implements OnInit {
  email = new FormControl('', Validators.required);

  constructor(private readonly restService: RestService, private readonly toastr: ToastrService) { }

  ngOnInit(): void {
  }

  submit() {
    this.restService
      .requestResetPassword(this.email.value)
      .subscribe(
        () => this.toastr.success('Check your email to reset password', 'Success'),
        (error) => this.toastr.error(error, 'Reset Password Error')
      );
  }

}
