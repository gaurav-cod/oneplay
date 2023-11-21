import { Component, OnInit, OnDestroy } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { CustomCountlyEvents } from "src/app/services/countly";
import { CountlyService } from "src/app/services/countly.service";
import { genDefaultSettingsViewSegments } from "src/app/utils/countly.util";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import {
  genDefaultMenuClickSegments,
  genDefaultMenuDropdownClickSegments,
  getGameLandingViewSource,
} from "src/app/utils/countly.util";
import { RestService } from "src/app/services/rest.service";
import { UserModel } from "src/app/models/user.model";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  activeTab: string;
  isOneplayUser = false;

  private user: UserModel;

  get isPrivate() {
    return this.user?.searchPrivacy;
  }

  private paramSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly authService: AuthService,
    private readonly countlyService: CountlyService,
    private readonly restService: RestService
  ) { }

  ngOnInit() {
    this.title.setTitle("OnePlay | Settings");
    this.paramSubscription = this.route.params.subscribe((params) => {
      this.activeTab = params.tab;
    });
    this.userSubscription = this.authService.user.subscribe(
      (user) => {
        this.isOneplayUser = user.partnerId === environment.partner_id;
        this.user = user;
      });
    this.countlyService.startEvent("settingsView", {
      data: genDefaultSettingsViewSegments(),
    });
  }

  ngOnDestroy() {
    this.countlyService.endEvent("settingsView");
    this.paramSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  redirectToSpeedTest() {
    this.router.navigate(['/speed-test']);
  }



  // async logout() {
  //   this.logoutRef.close();
  //   this.logDropdownEvent("logOutConfirmClicked");
  //   // wait for countly to send the req before deleting the session
  //   await new Promise((r) => setTimeout(r, 500));
  //   // this.messagingService.removeToken().finally(() => {
  //   this.restService.deleteSession(this.authService.sessionKey).subscribe();
  //   this.authService.loggedOutByUser = true;
  //   this.authService.logout();
  //   // });
  // }

  // LogoutAlert(container) {
  //   this.logDropdownEvent("logOutClicked");
  //   this.logoutRef = this.ngbModal.open(container, {
  //     centered: true,
  //     modalDialogClass: "modal-sm",
  //   });
  // }


  // onFocus() {
  //   this.focus.next(true);
  // }

  // onBlur() {
  //   this.countlyService.addEvent("search", {
  //     keywords: this.query.value,
  //     actionDone: "no",
  //     actionType: "cancelled",
  //   });
  //   this.focus.next(false);
  // }

  // open(container) {
  //   this.ngbModal.open(container, {
  //     centered: true,
  //     modalDialogClass: "modal-md",
  //     scrollable: true,
  //   });
  // }

  // TermsConditions(container: ElementRef<HTMLDivElement>) {
  //   this.ngbModal.open(container, {
  //     centered: true,
  //     modalDialogClass: "modal-md",
  //     scrollable: true,
  //   });
  // }

  // searchNavigate(tab: "games" | "users") {
  //   this.countlyService.addEvent("search", {
  //     keywords: this.query.value,
  //     actionDone: "yes",
  //     actionType: tab === "games" ? "seeMoreGames" : "seeMoreUsers",
  //   });
  //   if (tab === "games") {
  //     this.countlyService.startEvent("searchResultsViewMoreGames", {
  //       discardOldData: true,
  //       data: {
  //         keywords: this.query.value,
  //         gameCardClicked: "no",
  //       },
  //     });
  //   } else if (tab === "users") {
  //     this.countlyService.startEvent("searchResultsViewMoreUsers", {
  //       discardOldData: true,
  //       data: {
  //         keywords: this.query.value,
  //         friendRequestClicked: "no",
  //       },
  //     });
  //   }
  //   this.router.navigate(["/search", tab], {
  //     queryParams: { q: this.query.value },
  //   });
  // }


}
