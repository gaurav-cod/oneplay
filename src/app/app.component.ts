import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { environment } from "src/environments/environment";
import { RestService } from "./services/rest.service";
declare var gtag: Function;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "Oneplay Dashboard";
  seriousNotification: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly restService: RestService
  ) {
    const navEvents = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    );
    navEvents.subscribe((event: NavigationEnd) => {
      gtag("config", environment.ga_tracking_id, {
        page_path: event.urlAfterRedirects,
      });
    });
  }

  ngOnInit() {
    this.getSeriousNotification();
  }

  private getSeriousNotification() {
    this.restService.getSeriousNotification().subscribe((data) => {
      this.seriousNotification = data;
    });
  }
}
