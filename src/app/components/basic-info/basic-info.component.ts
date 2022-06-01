import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Session } from "src/app/models/session.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit {
  sessions: Session[] = [];
  ipLocationMap: { [key: string]: string } = {};
  loggingOut: boolean = false;

  username = new FormControl("", Validators.required);
  firstName = new FormControl("", Validators.required);
  lastName = new FormControl("", Validators.required);
  bio = new FormControl("", Validators.required);
  password = new FormControl("", Validators.required);
  phone = new FormControl("", Validators.required);
  email = new FormControl("", [Validators.required, Validators.email]);

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {
    this.authService.user.subscribe((user) => {
      this.username.setValue(user.username);
      this.firstName.setValue(user.firstName);
      this.lastName.setValue(user.lastName);
      this.bio.setValue(user.bio);
      this.phone.setValue(user.phone);
      this.email.setValue(user.email);

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
      if (!!user.phone) {
        this.phone.disable();
      }
      if (!!user.email) {
        this.email.disable();
      }
    });
  }

  ngOnInit(): void {
    this.restService.getSessions().subscribe((res) => {
      this.sessions = res;
      this.sessions.forEach((session) => {
        this.restService.getLocation(session.ip).subscribe((res) => {
          this.ipLocationMap[session.ip] = res;
        });
      });
    });
  }

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

  updatePhone(): void {
    if (!this.phone.valid) return;
    this.restService.updateProfile({ phone: this.phone.value }).subscribe(
      () => {
        this.authService.updateProfile({ phone: this.phone.value });
        this.phone.disable();
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

  updateEmail(): void {
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
          title: "Oops...",
          text: error,
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
          title: "Oops...",
          text: error,
        });
      }
    );
  }

  isActive(session: Session): boolean {
    return session.key === this.authService.sessionKey;
  }

  deleteSession(session: Session): void {
    this.loggingOut = true;
    this.restService.deleteSession(session.key).subscribe(
      () => {
        this.loggingOut = false;
        this.sessions = this.sessions.filter((s) => s.key !== session.key);
      },
      (error) => {
        this.loggingOut = false;
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
        });
      }
    );
  }
}
