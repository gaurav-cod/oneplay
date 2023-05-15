import { Component, OnInit, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  activeTab: string;
  isOneplayUser = false;

  private paramSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.title.setTitle("OnePlay | Settings");
    this.paramSubscription = this.route.params.subscribe(
      (params) => (this.activeTab = params.tab)
    );
    this.userSubscription = this.authService.user.subscribe(
      (user) =>
        (this.isOneplayUser = user.partnerId === environment.oneplay_partner_id)
    );
  }

  ngOnDestroy() {
    this.paramSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }
}
