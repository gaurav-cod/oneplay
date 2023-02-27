import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  activeTab: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly title: Title
  ) {
    this.route.params.subscribe((params) => (this.activeTab = params.tab));
  }

  ngOnInit() {
    this.title.setTitle("OnePlay | Settings");
  }
}
