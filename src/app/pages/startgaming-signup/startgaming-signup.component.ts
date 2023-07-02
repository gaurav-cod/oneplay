import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RestService } from 'src/app/services/rest.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { lastValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-startgaming-signup',
  templateUrl: './startgaming-signup.component.html',
  styleUrls: ['./startgaming-signup.component.scss']
})
export class StartgamingSignupComponent implements OnInit {

  private usernameRegex = /^[^\W\d_]{1}[^\W_]{2,11}$/

  private dateToNgbDate = (date: Date): NgbDateStruct => ({
    year: date.getUTCFullYear(),
    month: date.getMonth() +1,
    day: date.getDate(),
  })

  private dateMinusYears = (date: Date, count: number): Date => {
    date.setUTCFullYear(date.getUTCFullYear() - count);
    return date;
  }

  startGameForm = new FormGroup({ 
    username: new FormControl("", [
      Validators.required,
      Validators.pattern(this.usernameRegex),
    ]),
    dob: new FormControl(undefined, [Validators.required]),
  });

  minDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 100))
  maxDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 13))

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
    private readonly authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.setUserDetails();
  }

  async setUserDetails() {
    let user = await lastValueFrom(this.authService.user);
    if (!user) {
      user = await lastValueFrom(this.restService.getProfile());
      this.authService.user = of(user);
    }
    if (user.username && user.age) {
      this.router.navigate(["/home"], { replaceUrl: true });
    } else if (user.username) {
      this.startGameForm.patchValue({ username: user.username });
    }
  }

  startGaming() {
    if (!this.startGameForm.valid) return;
    let { year, month, day } = this.startGameForm.value.dob;
    this.restService.updateProfile({
      username: this.startGameForm.value.username,
      dob: new Date(year, month-1, day).toISOString().split('T')[0],
    }).subscribe({
      next: (user) => {
        this.authService.user = of(user);
        this.router.navigate(["/home"], { replaceUrl: true });
      },
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
