import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Session } from "src/app/models/session.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit {
  sessions: Session[] = [];
  ipLocationMap: { [key: string]: string } = {};
  loggingOut: boolean = false;

  username = new FormControl(
    { value: "", disabled: true },
    Validators.required
  );
  firstName = new FormControl(
    { value: "", disabled: true },
    Validators.required
  );
  lastName = new FormControl(
    { value: "", disabled: true },
    Validators.required
  );
  bio = new FormControl({ value: "", disabled: true }, Validators.required);
  password = new FormControl(
    { value: "", disabled: true },
    Validators.required
  );
  phone = new FormControl({ value: "", disabled: true }, Validators.required);
  email = new FormControl({ value: "", disabled: true }, [
    Validators.required,
    Validators.email,
  ]);

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService
  ) {
    this.authService.user.subscribe((user) => {
      this.username.setValue(user.username);
      this.firstName.setValue(user.firstName);
      this.lastName.setValue(user.lastName);
      this.bio.setValue(user.bio);
      this.phone.setValue(user.phone);
      this.email.setValue(user.email);
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
        this.toastr.error(error, "Update Username");
      }
    );
  }
  
  updateFirstName(): void {
    this.restService.updateProfile({ first_name: this.firstName.value }).subscribe(
      () => {
        this.authService.updateProfile({ firstName: this.firstName.value });
        this.firstName.disable();
      },
      (error) => {
        this.toastr.error(error, "Update First Name");
      }
    );
  }

  updateLastName(): void {
    this.restService.updateProfile({ last_name: this.lastName.value }).subscribe(
      () => {
        this.authService.updateProfile({ lastName: this.lastName.value });
        this.lastName.disable();
      },
      (error) => {
        this.toastr.error(error, "Update Last Name");
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
        this.toastr.error(error, "Update Bio");
      }
    );
  }

  updatePhone(): void {
    if (!this.phone.valid) return;
    this.restService.updateProfile({ phone: `${this.phone.value}` }).subscribe(
      () => {
        this.authService.updateProfile({ phone: this.phone.value });
        this.phone.disable();
      },
      (error) => {
        this.toastr.error(error, "Update Phone");
      }
    );
  }

  updateEmail(): void {
    this.restService.updateEmail(this.email.value).subscribe(
      (msg) => {
        this.toastr.success(msg, "Update Email");
        this.authService.logout();
      },
      (error) => {
        this.toastr.error(error, "Update Email");
      }
    );
  }

  updatePassword(): void {
    this.restService.updatePassword(this.password.value).subscribe(
      () => {
        this.toastr.success("Password updated successfully");
        this.password.reset();
        this.password.disable();
      },
      (error) => {
        this.toastr.error(error, "Update Password");
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
        this.toastr.error(error, "Delete Session");
      }
    );
  }
}
