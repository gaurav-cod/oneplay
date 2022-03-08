import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { RestService } from "src/app/services/rest.service";

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
    private restService: RestService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  reset() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.resetPassword(token, this.password.value).subscribe(
      () => {
        this.toastr.success("Password reset successfully");
        this.router.navigateByUrl("/login");
      },
      (error) => this.toastr.error(error, "Reset Password Error")
    );
  }
}
