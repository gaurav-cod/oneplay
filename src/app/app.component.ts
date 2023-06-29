import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter, Subscription } from "rxjs";
import { environment } from "src/environments/environment";
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
    private readonly elementRef: ElementRef,
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

  ngAfterViewInit() {
    this.initializeCountly();
  }

  ngOnInit() {
    // this.initializeCountly();
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

  private initializeCountly() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.innerHTML = `
//some default pre init
var Countly = Countly || {};
Countly.q = Countly.q || [];

//provide countly initialization parameters
Countly.debug = ${!environment.production};
Countly.app_key = "${environment.countly.key}";
Countly.url = "${environment.countly.url}";
//todo: --! whitelist what?
// Countly.heatmap_whitelist = "[${environment.domain}]";
Countly.app_version = "${environment.appVersion}";

Countly.q.push(['track_sessions']);
Countly.q.push(['track_pageview',location.pathname+location.hash]);
Countly.q.push(['track_clicks']);
Countly.q.push(['track_scrolls']);
Countly.q.push(['track_errors']);
Countly.q.push(['track_links']);
Countly.q.push(['collect_from_forms']);

//will collect hidden inputs
Countly.q.push(['track_forms', null, true]);

//load countly script asynchronously
(function() {
  var cly = document.createElement('script'); cly.type = 'text/javascript';
  cly.async = true;
  cly.src = "${environment.countly.src}";
  cly.onload = function(){
    Countly.init();
  };
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(cly, s);
})();

// utility function to queue countly events
function countlyPushAsync(a, e) {
  Countly.q.push([ a, e ]);
  console.log('cc tag:', [ a, e ], Countly.q )
}
    `;
    this.elementRef.nativeElement.insertBefore(s,
      this.elementRef.nativeElement.firstChild);
    this.countlyService.add_event({ key: 'js', segmentation: {
      time: new Date().toISOString(),
    }});
  }
}
