import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationModel } from 'src/app/models/notification.model';
import { NotificationService } from 'src/app/services/notification.service';
import { RestService } from 'src/app/services/rest.service';
import { environment } from 'src/environments/environment';
import Swal from "sweetalert2";

@Component({
  selector: 'app-notification-alert',
  templateUrl: './notification-alert.component.html',
  styleUrls: ['./notification-alert.component.scss']
})
export class NotificationAlertComponent implements OnInit {

  showNotificationContent: boolean = false;
  showSecondaryCTA: boolean = false;

  @Input() notification: any;

  constructor(
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly notificationService: NotificationService
  ) {
  }
  ngOnInit(): void {
    this.notification = {
      ...this.notification,
      showActionBtns: false
    }
  }

  toggleNotificationContent() {
    this.showNotificationContent = !this.showNotificationContent;
  }
  toggleSecondaryCTA() {
    this.showSecondaryCTA = !this.showSecondaryCTA;
  }

  navigateByCTA(type: "RENEW" | "BUY_NOW" | "ACCEPT" | "RESET_PASSWORD" | "DOWNLOAD" | "RETRY" | "IGNORE" | "REJECT", notification: NotificationModel) {
    switch (type) {
      case "REJECT" || "IGNORE":
        this.notificationService.setShowAlertNotification(false);
        break;
      case "BUY_NOW":
        this.renewSubscription();
        break;
      case "ACCEPT":
        this.acceptFriendRequest();
        break;
      case "DOWNLOAD":
        this.notificationService.setShowAlertNotification(false);
        window.open(environment.domain + "/subscription.html");
        break;
      case "RENEW":
        this.renewSubscription();
        break;
      case "RESET_PASSWORD":
        this.notificationService.setShowAlertNotification(false);
        this.router.navigate(['/dashboard/settings/security']);
        break;
      case "RETRY":
        break;
    }
  }

  messageClicked() {
    switch (this.notification.subType) {
      case "WELCOME_MESSAGE":
        break;
      case "SCHEDULED_MAINTENANCE":
        this.router.navigate(['/dashboard']);
        break;
      case "SUBSCRIPTION_EXPIRING" || "SUBSCRIPTION_EXPIRED":
        this.renewSubscription();
        break;
      case "LIMITED_TOKEN_REMAIN":
        break;
      case "NEW_GAMES_AVAILABLE" || "GAME_UPDATE_AVAILABLE":
        break;
      case "DISCOUNT_OFFER":
        break;
      case "PASSWORD_CHANGE" || "UNUSUAL_ACCOUNT_ACTIVITY":
        this.router.navigate(['/dashboard/settings/security']);
        break;
      case "PAYMENT_FAILED":
        break;
      case "PAYMENT_SUCCESS":
        break;
      case "FRIEND_REQUEST":
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
  toggleNotificationActionBtn() {
    this.notification.showActionBtns = !this.notification.showActionBtns;
  }
  renewSubscription() {
    this.restService.getCurrentSubscription().subscribe({
      next: (response) => {
        if (response?.length === 0) {
          window.open(environment.domain + '/subscription.html', '_self');
        } else {
          this.router.navigate(['/settings/subscription']);
        }
      }, error: (err) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + err.code,
          text: err.message,
        });
      }
    })
  }
  acceptFriendRequest() {

    this.restService.acceptFriend(this.notification.data?.friend_id).subscribe((response) => {
      this.notificationService.setShowAlertNotification(false);
    }, (error: any) => {

    }, () => {

    });
  }
  markRead() {
    this.restService.markNotificationRead(this.notification.notificationId).subscribe({
      next: () => {
        this.notificationService.setShowAlertNotification(false);
      }, error: () => {

      }
    })
  }
  markUnread() {
    this.restService.markNotificationUnRead(this.notification.notificationId).subscribe({
      next: () => {
        this.notificationService.setShowAlertNotification(false);
      }, error: () => {
      }
    })
  }
}
