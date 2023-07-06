import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { GamepadService } from "./services/gamepad.service";
import { RestService } from "./services/rest.service";
import { ToastService } from "./services/toast.service";
import { CountlyService } from "./services/countly.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "Oneplay Dashboard";
  seriousNotification: string | null = null;

  private gamepadMessageSubscription: Subscription;

  constructor(
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly toastService: ToastService,
    private readonly gamepadService: GamepadService,
    private readonly countlyService: CountlyService
  ) {
    const navEvents = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    );
    navEvents.subscribe((event: NavigationEnd) => {
      window.scrollTo(0, 0);
      countlyService.track_pageview(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.getSeriousNotification();

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

    this.gamepadService.init();

    window.addEventListener("popstate", this.closeSwals.bind(this));
  }

  ngOnDestroy(): void {
    this.gamepadService.destroy();
    this.toastService.clear();
    this.gamepadMessageSubscription.unsubscribe();
    window.removeEventListener("popstate", this.closeSwals.bind(this));
  }

  private closeSwals() {
    Swal.close();
  }

  private getSeriousNotification() {
    this.restService.getSeriousNotification().subscribe((data) => {
      this.seriousNotification = data;
    });
  }
}