import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { GamepadService } from "./services/gamepad.service";
import { RestService } from "./services/rest.service";
import { ToastService } from "./services/toast.service";
import { CountlyService } from "./services/countly.service";
import Swal from "sweetalert2";
import { AuthService } from "./services/auth.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "OnePlay - India’s biggest BYOG cloud gaming platform | Everything gaming.";
  seriousNotification: string | null = null;

  initialized: boolean = false;
  private isLoggedIn: boolean = false;

  private gamepadMessageSubscription: Subscription;
  private isLoggedInUserSub: Subscription;

  constructor(
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly toastService: ToastService,
    private readonly gamepadService: GamepadService,
    private readonly authService: AuthService,
    private readonly countlyService: CountlyService
  ) {
    const navEvents = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    );
    navEvents.subscribe((event: NavigationEnd) => {
      window.scrollTo(0, 0);
      this.countlyService.track_pageview(event.urlAfterRedirects);
    });
  }

  ngOnInit() {

    localStorage.setItem("x-partner-id", environment.partner_id);
    if (this.authService.sessionToken) {
      this.initialized = true;
    } else {
      this.restService
        .getLogInURL()
        .toPromise()
        .then(({ partner_id }) => {
          environment.partner_id = partner_id;
          localStorage.setItem("x-partner-id", partner_id);
          this.initialized = true;
        })
        .catch(() => {
          this.initialized = true;
        });
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Make your API call here after every navigation
        this.getSeriousNotification();
        if (this.isLoggedIn) this.updateUser();
      });

    this.gamepadMessageSubscription = this.gamepadService.message.subscribe(
      (message) => {
        if (!!message) {
          this.toastService.show(message.text, {
            classname: `bg-gray-dark text-${message.color}`,
            delay: 4000,
          });
          this.gamepadService.nullifyMessage();
        }
      }
    );

    this.isLoggedInUserSub = this.authService.sessionTokenExists.subscribe(
      (exists) => {
        this.isLoggedIn = exists;
        if (exists) {
          this.updateUser();
          this.restService
            .visitCasulGamingSection()
            .toPromise()
            .catch(() => {});
        }
      }
    );

    this.gamepadService.init();

    window.addEventListener("popstate", this.closeSwals.bind(this));
  }

  ngOnDestroy(): void {
    this.gamepadService.destroy();
    this.toastService.clear();
    this.gamepadMessageSubscription?.unsubscribe();
    this.isLoggedInUserSub?.unsubscribe();
    window.removeEventListener("popstate", this.closeSwals.bind(this));
  }

  private closeSwals() {
    Swal.close();
  }

  private getSeriousNotification() {
    this.restService.getSeriousNotification().subscribe((data) => {
      this.seriousNotification = data;
      if (data)
        this.authService.setSeriousNotificationPresent(true);
    });
  }

  private updateUser() {
    this.restService
      .getProfile()
      .toPromise()
      .then((u) => this.authService.setUser(u))
      .catch(() => {});
  }
}
