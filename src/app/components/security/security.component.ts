import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-security",
  templateUrl: "./security.component.html",
  styleUrls: ["./security.component.scss"],
})
export class SecurityComponent implements OnInit {
  password = new FormControl("", Validators.required);
  phone = new FormControl("", [
    Validators.required,
    Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/),
  ]);
  email = new FormControl("", [Validators.required, Validators.email]);

  private user: UserModel;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {
    this.authService.user.subscribe((user) => {
      this.user = user;

      this.phone.setValue(user.phone);
      this.email.setValue(user.email);

      if (!!user.phone) {
        this.phone.disable();
      }
      if (!!user.email) {
        this.email.disable();
      }
    });
  }

  ngOnInit(): void {}

  updatePhone(): void {
    if (!this.phone.valid) return;
    this.phone.disable();
    if (this.user.phone === this.phone.value.trim()) return;
    this.restService.updateProfile({ phone: this.phone.value }).subscribe(
      () => {
        this.authService.updateProfile({ phone: this.phone.value });
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully updated phone number.",
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }

  updateEmail(): void {
    if (this.email.invalid) return;
    this.email.disable();
    if (this.user.email === this.email.value.trim()) return;
    this.restService.updateEmail(this.email.value).subscribe(
      (msg) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: msg,
        });
        this.authService.logout();
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }

  updatePassword(): void {
    this.restService.updatePassword(this.password.value).subscribe(
      () => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password updated successfully",
        });
        this.password.reset();
        this.password.disable();
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }
}
