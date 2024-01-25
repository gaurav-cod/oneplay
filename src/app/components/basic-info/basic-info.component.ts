import { Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { UpdateProfileDTO } from "src/app/interface";
import { UserModel } from "src/app/models/user.model";
import { AvatarPipe } from "src/app/pipes/avatar.pipe";
import { AuthService } from "src/app/services/auth.service";
import { CustomTimedCountlyEvents } from "src/app/services/countly";
import { CountlyService } from "src/app/services/countly.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  username = new UntypedFormControl("", [Validators.required]);

  name = new UntypedFormControl("", [
    Validators.required,
    Validators.pattern(/^[a-zA-Z\s]*$/),
  ]);

  bio = new UntypedFormControl("", [
    // Validators.required,
    Validators.maxLength(300),
  ]);

  dob = new UntypedFormControl(undefined, [Validators.required]);

  private dateToNgbDate = (date: Date): NgbDateStruct => ({
    year: date.getUTCFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });

  private dateMinusYears = (date: Date, count: number): Date => {
    date.setUTCFullYear(date.getUTCFullYear() - count);
    return date;
  };

  
  minDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 100));
  maxDate = this.dateToNgbDate(this.dateMinusYears(new Date(), 13));

  photo: string | ArrayBuffer;
  saveProfileLoder = false;

  showInitialUserMessage: boolean = false;

  private userSubscription: Subscription;
  private currentUserState: UserModel;
  private isFirstTimeEntering: boolean = true;
  private user: UserModel;
  private photoFile: File;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit(): void {
    this.countlyService.updateEventData("settingsView", {
      profileViewed: "yes",
    });
    this.userSubscription = this.authService.user.subscribe((user) => {
      this.currentUserState = user;
      this.username.setValue(user.username);
      this.name.setValue(user.name);
      this.bio.setValue(user.bio);
      this.dob.setValue((user.dob ? this.dateToNgbDate(new Date(user.dob)) : ""));
      this.photo = user.photo || "assets/img/singup-login/" + user.gender + ".svg";
    });

    // show initial message only in mobile screen
    this.showInitialUserMessage = this.authService.defaultUsernameGiven && window.innerWidth < 475 && this.isFirstTimeEntering;
    if (this.isFirstTimeEntering)
      this.isFirstTimeEntering = false;
    setTimeout(()=> {
      this.showInitialUserMessage = false;
    }, 3000);
  }
  focusElement(element: any) {
    if (element)
      element.focus();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    Swal.close();
  }

  get title() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  get isValid() {
    return this.username.valid && this.bio.valid;
  }

  get isChanged() {
    const date = this.dateToNgbDate(new Date(this.currentUserState.dob));
    this.bio.setValue(this.bio.value ? this.bio.value : "");
    return (
      this.name.value !== this.currentUserState.name ||
      this.username.value !== this.currentUserState.username ||
      this.bio.value !== (this.currentUserState.bio ?? "") ||
      this.dob.value["day"] !== (date["day"] ?? null) ||
      this.dob.value["month"] !== (date["month"] ?? null) ||
      this.dob.value["year"] !== (date["year"] ?? null) ||
      !!this.photoFile
    );
  }

  get dateOfBirthErrored() {
    const control = this.dob;
    return (control.touched || control.dirty) && control.invalid;
  }

  onUpdateInput(key: keyof CustomTimedCountlyEvents["settingsView"]) {
    const isChanged =
      this.countlyService.getEventData("settingsView")[key] === "yes";

    if (!isChanged) {
      this.countlyService.updateEventData("settingsView", { [key]: "yes" });
    }
  }

  onUserError(event) {
    event.target.src = "assets/img/defaultUser.svg";
  }

  onFileChanged(input) {
    if (
      input.target.files[0] &&
      input.target.value.match(/\.(jpg|png|webp|jpeg)$/)
    ) {
      this.countlyService.updateEventData("settingsView", {
        profilePictureChanged: "yes",
      });
      const reader = new FileReader();
      this.photoFile = input.target.files[0] as File;
      reader.onload = (e) => {
        this.photo = e.target.result;
      };

      reader.readAsDataURL(input.target.files[0]);
    }
  }

  saveChanges(): void {
    this.countlyService.updateEventData("settingsView", {
      updateProfileClicked: "yes",
    });
    const body: any = {};
    if (!!this.username.value) {
      body.username = this.username.value;
    }
    if (!!this.name.value && this.name.value?.replaceAll(" ", "")?.length > 0) {
      const [first_name, ...rest] = this.name.value.trim().split(" ");
      const last_name = rest.join(" ") || "";
      body.first_name = first_name;
      if (!!last_name) {
        body.last_name = last_name;
      } else {
        body.last_name = "";
      }
    }
    if (!!this.bio.value && this.bio.value?.length > 0) {
      body.bio = this.bio.value;
    } else {
      body.bio = "";
    }
    if (!!this.photoFile) {
      body.profile_image = this.photoFile;
    }
    if (!!this.dob.value && this.dob.value["day"]) {
      const year = this.dob.value['year'];
      const month = this.dob.value['month'] < 10 ? "0" + this.dob.value['month'] : this.dob.value['month'];
      const day = this.dob.value['day'] < 10 ? "0" + this.dob.value['day'] : this.dob.value['day'];
      body.dob = `${year}-${month}-${day}`;
    }

    this.saveProfileLoder = true;

    this.restService.updateProfile(body).subscribe(
      (data) => {
        
        if (body.username) {
          this.authService.setDefaultUsernameGiven(false);
        }

        this.authService.updateProfile({
          username: body.username,
          firstName: body.first_name,
          lastName: body.last_name,
          bio: body.bio,
          photo: this.photo as string,
          dob: body.dob
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
        this.showError(error);
      }
    );
  }

  showError(error) {
    if (!error.data.icon) {
      error.data.icon = "assets/img/swal-icon/Account.svg";
    }
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    })
  }
}
