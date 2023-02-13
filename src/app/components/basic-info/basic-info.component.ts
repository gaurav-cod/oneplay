import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
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
  saveProfileLoder = false;
  private userSubscription: Subscription
  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {
    
  }

  ngOnInit(): void {
    this.userSubscription = 
    this.authService.user.subscribe((user) => {
      this.username.setValue(user.username);
      this.name.setValue(user.name);
      this.bio.setValue(user.bio);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe()
  }

  saveChanges(): void {
    const body: object = {}
    if(!!this.username.value) {
      body['username'] = this.username.value
    }
    if(!!this.name.value) {
      const [first_name, last_name] = this.name.value.split(' ');
      body['first_name'] = first_name
      if(!!last_name) {
        body['last_name'] = last_name
      } else {
        body['last_name'] = ''  
      }
    }
    if(!!this.bio.value) {
      body['bio'] = this.bio.value
    } else {
      body['bio'] = ''
    }

    this.saveProfileLoder = true;

    this.restService.updateProfile(body).subscribe(
      () => {
        this.authService.updateProfile({
          username: body['username'],
          firstName: body['first_name'],
          lastName: body['last_name'],
          bio: body['bio']
        });
        Swal.fire({
          icon: "success",
          title: "Updated Profile",
          text: "Saved Changes!",
        });
        this.saveProfileLoder = false;
      },
      (error) => {
        this.saveProfileLoder = false;
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error,
        });
      }
    );
  }
}

