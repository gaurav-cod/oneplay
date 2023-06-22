import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { RestService } from 'src/app/services/rest.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-startgaming-signup',
  templateUrl: './startgaming-signup.component.html',
  styleUrls: ['./startgaming-signup.component.scss']
})
export class StartgamingSignupComponent implements OnInit {

  private usernameRegex = /^[^\W\d_]{1}[^\W_]{2,11}$/
  usernameError = "*invalid Username"

  startGameForm = new FormGroup({ 
    username: new FormControl("", [
      Validators.required,
      Validators.pattern(this.usernameRegex),
    ]),
    dob: new FormControl({} as NgbDateStruct, [Validators.required]),
  });

  maxDate ={year: new Date().getUTCFullYear()}
  minDate ={year: new Date().getUTCFullYear()-100,month: 12, day: 31}

  get usernameErrored() {
    const control = this.startGameForm.controls["username"];
    return control.touched && control.invalid;
  }

  get dateOfBirthErrored() {
    const control = this.startGameForm.controls["dob"];
    return control.touched && control.invalid;
  }

  get checkvalidationValue() {
    return this.startGameForm.invalid;
  }

  constructor(
    private readonly restService: RestService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    const debouncedSearch = AwesomeDebouncePromise(
      (value) => this.verifyUserName(value), 1000);
    this.startGameForm.get('username').valueChanges
      .subscribe(v => debouncedSearch(v));
  }

  verifyUserName(username: string) {
    if (!this.usernameRegex.test(username)) return;
    this.restService.verifyUserName(username).subscribe(res => {
      if (res !== "") {
        Swal.fire({
          title: res,
          // text: res,
          icon: "error",
          confirmButtonText: "Try Another",
        });
        this.usernameError = `*${res}`;
        this.startGameForm.controls['username'].setErrors({ incorrect: true });
      }
    })
  }

  startGaming() {
    if (!this.startGameForm.valid) return;
    let { year, month, day } = this.startGameForm.value.dob;
    this.restService.updateProfile({
      username: this.startGameForm.value.username,
      dob: new Date(year, month-1, day).toISOString().split('T')[0],
    }).subscribe(_ => this.router.navigateByUrl('/'))
  }

  get domain() {
    return environment.domain;
  }
}
