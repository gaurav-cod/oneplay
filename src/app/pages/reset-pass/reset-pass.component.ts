import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { RestService } from "src/app/services/rest.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
  selector: "app-reset-pass",
  templateUrl: "./reset-pass.component.html",
  styleUrls: ["./reset-pass.component.scss"],
})
export class ResetPassComponent implements OnInit {

  resetForm = new FormGroup({
    password: new FormControl("", [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)]),
    confirmPassword: new FormControl("",  [Validators.required]),
  });

  get checkvalidationValue() {
    if(this.resetForm.value.password.length && this.resetForm.value.password === this.resetForm.value.confirmPassword) {
      return false;
    } else {
      return true;
    }
  }

  get passwordErrored() {
    const control = this.resetForm.controls["password"];
    return control.touched && control.invalid;
  }

  get confirmPasswordErrored() {
    const control = this.resetForm.controls["confirmPassword"];
    if(this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      return control.touched && true;
    } else {
      return control.touched && false;
    }
    
  }
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle("Reset Password");
  }

  showPassword = false;
  showConfirmPassword = false;

  reset() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.resetPassword(token, this.resetForm.value.password).subscribe(
      () => {
        Swal.fire({
          title: "Success",
          text: "Password reset successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        this.router.navigateByUrl("/login");
      },
      (error) =>
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
          confirmButtonText: "Try Again",
        })
    );
  }

  get domain() {
    return environment.domain;
  }
}
