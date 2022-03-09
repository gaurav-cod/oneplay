import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.scss"],
})
export class VerifyComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restService: RestService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  verify() {
    const token = this.route.snapshot.paramMap.get("token");
    this.restService.verify(token).subscribe(
      () => {
        this.toastr.success("Your account has been verified. You can now login.", "Verification Success");
        this.router.navigateByUrl("/login");
      },
      (error) => this.toastr.error(error)
    );
  }
}
