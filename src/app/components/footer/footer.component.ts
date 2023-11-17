import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CustomCountlyEvents } from 'src/app/services/countly';
import { CountlyService } from 'src/app/services/countly.service';
import { genDefaultWebsiteFooterViewSegments } from 'src/app/utils/countly.util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  test: Date = new Date();
  isInSettingPage: boolean = false; // need to remove footer link when in setting page

  constructor(
    private readonly countlyService: CountlyService,
    private readonly router: Router
  ) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isInSettingPage = this.router.url.includes("settings");
      }
    });
  }

  ngOnInit() {
  }

  logCountlyEvent(
    item: keyof CustomCountlyEvents['websiteFooterView']
  ): void {
    this.countlyService.addEvent("websiteFooterView", {
      ...genDefaultWebsiteFooterViewSegments(),
      [item]: 'yes',
    })
  }

  get domain() {
    return environment.domain;
  }

}
