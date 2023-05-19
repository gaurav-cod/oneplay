import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-startgaming-signup',
  templateUrl: './startgaming-signup.component.html',
  styleUrls: ['./startgaming-signup.component.scss']
})
export class StartgamingSignupComponent implements OnInit {

  startGameForm = new FormGroup({ 
    username: new FormControl("", [Validators.required]),
    // date_of_birth: new FormControl("", [Validators.required]),
  });

  maxDate ={year: new Date().getUTCFullYear()}
  minDate ={year: new Date().getUTCFullYear()-100,month: 12, day: 31}

  get usernameErrored() {
    const control = this.startGameForm.controls["username"];
    return control.touched && control.invalid;
  }

  get dateOfBirthErrored() {
    const control = this.startGameForm.controls["date_of_birth"];
    return control.touched && control.invalid;
  }

  get checkvalidationValue() {
    return this.startGameForm.invalid;
  }

  constructor() { }

  ngOnInit(): void {
  }

  startGaming() {
    
  }

  get domain() {
    return environment.domain;
  }
}
