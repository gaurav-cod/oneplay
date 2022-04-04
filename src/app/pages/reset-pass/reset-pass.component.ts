import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-reset-pass",
  templateUrl: "./reset-pass.component.html",
  styleUrls: ["./reset-pass.component.scss"],
})
export class ResetPassComponent implements OnInit {
  password = new FormControl("", Validators.required);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService
  ) {}

  ngOnInit(): void {}

  reset() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.resetPassword(token, this.password.value).subscribe(
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
          title: "Opps...",
          text: "Error resetting password",
          icon: "error",
          confirmButtonText: "OK",
        })
    );
  }
}
