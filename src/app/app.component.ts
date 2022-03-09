import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { environment } from "src/environments/environment";
declare var gtag: Function;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "Oneplay Dashboard";

  constructor(private readonly router: Router) {
    const navEvents = router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    );
    navEvents.subscribe((event: NavigationEnd) => {
      gtag("config", environment.ga_tracking_id, {
        page_path: event.urlAfterRedirects,
      });
    });
  }
}
