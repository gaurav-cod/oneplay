import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit {
  username = new FormControl("", Validators.required);
  firstName = new FormControl("", Validators.required);
  lastName = new FormControl("", Validators.required);
  bio = new FormControl("", Validators.required);

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {
    this.authService.user.subscribe((user) => {
      this.username.setValue(user.username);
      this.firstName.setValue(user.firstName);
      this.lastName.setValue(user.lastName);
      this.bio.setValue(user.bio);

      if (!!user.username) {
        this.username.disable();
      }
      if (!!user.firstName) {
        this.firstName.disable();
      }
      if (!!user.lastName) {
        this.lastName.disable();
      }
      if (!!user.bio) {
        this.bio.disable();
      }
    });
  }

  ngOnInit(): void {}

  updateUsername(): void {
    this.restService.updateProfile({ username: this.username.value }).subscribe(
      () => {
        this.authService.updateProfile({ username: this.username.value });
        this.username.disable();
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
        });
      }
    );
  }

  updateFirstName(): void {
    this.restService
      .updateProfile({ first_name: this.firstName.value })
      .subscribe(
        () => {
          this.authService.updateProfile({ firstName: this.firstName.value });
          this.firstName.disable();
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error,
          });
        }
      );
  }

  updateLastName(): void {
    this.restService
      .updateProfile({ last_name: this.lastName.value })
      .subscribe(
        () => {
          this.authService.updateProfile({ lastName: this.lastName.value });
          this.lastName.disable();
        },
        (error) => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error,
          });
        }
      );
  }

  updateBio(): void {
    this.restService.updateProfile({ bio: this.bio.value }).subscribe(
      () => {
        this.authService.updateProfile({ bio: this.bio.value });
        this.bio.disable();
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
        });
      }
    );
  }
}
