import { Component, OnInit } from '@angular/core';
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
    dob: new FormControl(
      this.dateToNgbDate(this.dateMinusYears(new Date(), 13)),
      [Validators.required],
    ),
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
  ) { }

  ngOnInit(): void {
    this.setUserDetails();
  }

  async setUserDetails() {
    let user = await this.restService.getProfile().toPromise()
    this.startGameForm.patchValue({
      username: user.username ?? '',
      dob: this.dateToNgbDate(new Date(user.dob)),
    });
  }

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
