import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RestService } from 'src/app/services/rest.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-startgaming-signup',
  templateUrl: './startgaming-signup.component.html',
  styleUrls: ['./startgaming-signup.component.scss']
})
export class StartgamingSignupComponent {

  private usernameRegex = /^[^\W\d_]{1}[^\W_]{2,11}$/

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

  startGaming() {
    if (!this.startGameForm.valid) return;
    let { year, month, day } = this.startGameForm.value.dob;
    this.restService.updateProfile({
      username: this.startGameForm.value.username,
      dob: new Date(year, month-1, day).toISOString().split('T')[0],
    }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (error) => Swal.fire({
        icon: "error",
        title: "Error Code: " + error.code,
        text: error.message,
      }),
    });
  }

  get domain() {
    return environment.domain;
  }
}
