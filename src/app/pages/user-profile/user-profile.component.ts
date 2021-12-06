import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  activeTab: string;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {
    this.route.params.subscribe(params => {
      if (!params.tab) {
        this.router.navigate(['/user-profile', 'basic-info']);
      } else {
        this.activeTab = params.tab;
      }
    });
  }

  ngOnInit() {
  }

}
