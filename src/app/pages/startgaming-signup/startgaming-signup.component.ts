import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-startgaming-signup',
  templateUrl: './startgaming-signup.component.html',
  styleUrls: ['./startgaming-signup.component.scss']
})
export class StartgamingSignupComponent implements OnInit {

  showUsername = false;
  username = new FormControl("", [Validators.required]);
  date_of_birth = new FormControl("", [Validators.required]);

  constructor() { }

  ngOnInit(): void {
  }

  startGaming() {
    
  }

  get domain() {
    return environment.domain;
  }
}
