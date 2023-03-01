import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { UpdateProfileDTO } from "src/app/interface";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  username = new FormControl("", Validators.required);
  name = new FormControl("", Validators.required);
  bio = new FormControl("", Validators.required);
  photo: string | ArrayBuffer;
  saveProfileLoder = false;
  private userSubscription: Subscription;
  private currentUserState: UserModel;
  private user: UserModel;
  private photoFile: File;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
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
  }

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  onFileChanged(input) {
    if (
      input.target.files[0] &&
      input.target.value.match(/\.(jpg|png|svg|jpeg)$/)
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
      const [first_name, last_name] = this.name.value.split(" ");
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
      () => {
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
