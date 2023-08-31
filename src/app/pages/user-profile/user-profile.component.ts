import { Component, OnInit, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { genDefaultSettingsViewSegments } from "src/app/utils/countly.util";
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
    private readonly authService: AuthService,
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit() {
    this.title.setTitle("OnePlay | Settings");
    this.paramSubscription = this.route.params.subscribe((params) => {
      this.activeTab = params.tab;
    });
    this.userSubscription = this.authService.user.subscribe(
      (user) =>
        (this.isOneplayUser = user.partnerId === environment.oneplay_partner_id)
    );
    this.countlyService.startEvent("settingsView", {
      data: genDefaultSettingsViewSegments(),
    });
  }

  ngOnDestroy() {
    this.countlyService.endEvent("settingsView");
    this.paramSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }
}
