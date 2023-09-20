import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { CountlyService } from 'src/app/services/countly.service';

@Component({
  selector: 'app-tv-auth-layout',
  templateUrl: './tv-auth-layout.component.html',
  styleUrls: ['./tv-auth-layout.component.scss']
})
export class TvAuthLayoutComponent implements OnInit {

  constructor(
    private readonly router: Router,
    // private readonly countlyService: CountlyService,
  ) { }

  ngOnInit(): void {
  }

  goToLogin() {
    // this.countlyService.addEvent("signINButtonClick", {
    //   page: location.pathname + location.hash,
    //   trigger: "header",
    //   channel: "web",
    // });
    this.router.navigate(["/login"]);
  }

}
