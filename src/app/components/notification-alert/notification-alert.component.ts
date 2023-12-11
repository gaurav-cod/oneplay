import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-alert',
  templateUrl: './notification-alert.component.html',
  styleUrls: ['./notification-alert.component.scss']
})
export class NotificationAlertComponent {

  showNotificationContent: boolean = false;
  constructor(
    private router: Router
  ) { }

  toggleNotificationContent() {
    this.showNotificationContent = !this.showNotificationContent;
  }
}
