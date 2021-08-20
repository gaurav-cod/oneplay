import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(private readonly restService: RestService) { }

  ngOnInit() {
  }
  ngOnDestroy() {
  }

  login() {
    this.restService
      .login(this.loginForm.value)
      .subscribe(() => { }, (error) => { alert(error) });
  }

}
