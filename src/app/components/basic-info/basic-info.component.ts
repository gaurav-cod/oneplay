import { Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { UpdateProfileDTO } from "src/app/interface";
import { UserModel } from "src/app/models/user.model";
import { AvatarPipe } from "src/app/pipes/avatar.pipe";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  username = new UntypedFormControl("", [
    Validators.required,
  ]);

  name = new UntypedFormControl("", [
    Validators.required,
    Validators.pattern(/^[a-zA-Z\s]*$/),
  ]);

  bio = new UntypedFormControl("", [
    // Validators.required,
    Validators.maxLength(300),
  ]);
  
  photo: string | ArrayBuffer;
  saveProfileLoder = false;
  private userSubscription: Subscription;
  private currentUserState: UserModel;
  private user: UserModel;
  private photoFile: File;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly countlyService: CountlyService,
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user.subscribe((user) => {
      this.currentUserState = user;
      this.username.setValue(user.username);
      this.name.setValue(user.name);
      this.bio.setValue(user.bio);
      this.photo = user.photo;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    Swal.close();
  }

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get isValid() {
    return this.name.valid && this.username.valid && this.bio.valid;
  }

  onUserError(event) {
    event.target.src = 'assets/img/defaultUser.svg';
  }

  onFileChanged(input) {
    if (
      input.target.files[0] &&
      input.target.value.match(/\.(jpg|png|webp|jpeg)$/)
    ) {
      const reader = new FileReader();
      this.photoFile = input.target.files[0] as File;
      reader.onload = (e) => {
        this.photo = e.target.result;
      };

      reader.readAsDataURL(input.target.files[0]);
    }
  }

  saveChanges(): void {
    const body: UpdateProfileDTO = {};
    if (!!this.username.value) {
      body.username = this.username.value;
    }
    if (!!this.name.value) {
      const [first_name, ...rest] = this.name.value.trim().split(" ");
      const last_name = rest.join(" ") || '';
      body.first_name = first_name;
      if (!!last_name) {
        body.last_name = last_name;
      } else {
        body.last_name = "";
      }
    }
    if (!!this.bio.value) {
      body.bio = this.bio.value;
    } else {
      body.bio = "";
    }
    if (!!this.photoFile) {
      body.profile_image = this.photoFile;
    }

    if (
      this.currentUserState.username == (this.username.value ?? null) &&
      this.currentUserState.name == this.name.value &&
      this.currentUserState.bio == (this.bio.value ?? null) &&
      !body.profile_image
    ) {
      return;
    }

    this.saveProfileLoder = true;

    this.restService.updateProfile(body).subscribe(
      (data) => {
        this.countlyService.updateUser('username', data.username);
        this.countlyService.updateUser('name', data.name);
        if (data.photo) {
          this.countlyService.updateUser('picture', data.photo);
        }
        this.countlyService.saveUser();
        this.authService.updateProfile({
          username: body.username,
          firstName: body.first_name,
          lastName: body.last_name,
          bio: body.bio,
          photo: this.photo as string,
        });
        Swal.fire({
          icon: "success",
          title: "Updated Profile",
          text: "Saved Changes!",
        });
        this.photoFile = null;
        this.saveProfileLoder = false;
      },
      (error) => {
        this.saveProfileLoder = false;
        Swal.fire({
          icon: "error",
          title: "Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }
}
