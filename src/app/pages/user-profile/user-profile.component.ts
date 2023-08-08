import { Component, OnInit, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { CustomTimedCountlyEvents } from "src/app/services/countly";
import { CountlyService } from "src/app/services/countly.service";
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
    private readonly countlyService: CountlyService,
  ) {}

  ngOnInit() {
    console.warn('xset init')
    this.title.setTitle("OnePlay | Settings");
    this.paramSubscription = this.route.params.subscribe(
      (params) => {
        if (this.activeTab === "profile") {
          //todo: questional exit! it's probably the whole settings page.
          this.countlyService.endEvent("profileView")
        }
        this.activeTab = params.tab;
        if (this.activeTab === "profile") {
            this.countlyService.startEvent("profileView", {
            data: {
              profileViewed: "yes",
              loginsecurityViewed: "no",
              profilePictureChanged: "no",
              userNameChanged: "no",
              FullNameChanged: "no",
              bioChanged: "no",
              updateProfileClicked: "no",
              passwordChanged: "no",
            }
          })
        } else if (this.activeTab === "security") {
          this.countlyService.updateEventData("profileView", {
            loginsecurityViewed: "yes",
          })
        }
      }
    );
    this.userSubscription = this.authService.user.subscribe(
      (user) =>
        (this.isOneplayUser = user.partnerId === environment.oneplay_partner_id)
    );
    this.countlyService.startEvent("settingsView", {
      data: {
        turnOffPrivacyEnabled: "no",
        turnOffPrivacyDisabled: "no",
        deleteSessionDataClicked: "no",
        deleteSessionDataConfirmClicked: "no",
        tvSignInClicked: "no",
        logOutClicked: "no",
        logOutConfirmClicked: "no",
        subscriptionViewed: "no",
        deviceHistoryViewed: "no",
        logoutFromAllClicked: "no",
      }
    });
  }

  ngOnDestroy() {
    console.warn('xset dest')
    // this.countlyService.endEvent("profileView");
    this.countlyService.endEvent("settingsView");
    this.paramSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  logCountly(segment: CustomTimedCountlyEvents["settingsView"]) {
    // this.countlyService.updateEventData("settingsView", segment)
  }
}
