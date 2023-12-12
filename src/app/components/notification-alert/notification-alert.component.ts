import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationModel } from 'src/app/models/notification.model';
import { RestService } from 'src/app/services/rest.service';

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
    private readonly restService: RestService
  ) {
    this.notification = new NotificationModel({
      "data": {
        "friend_name": "MrJZ",
        "friend_id": "db42ba05-3bfa-466b-bc9d-037595ccf76e",
        "friend_request_id": "c9bca495-a13d-4ece-b1a5-4edf56f8cff2"
      },
      "is_new": false,
      "description": "",
      "created_at": 1702283936112,
      "notification_id": "de9b4424-7a46-429b-93c9-11747636e94e",
      "title": "You've received a friend request from MrJZ. Accept to connect and play games together!",
      "type": "question",
      "version": 1,
      "is_read": false,
      "delete_allowed": true,
      "updated_at": 1702360693508,
      "user_id": "9d2100b9-7304-43bd-acdd-c13f461a0810",
      "sub_type": "FRIEND_REQUEST",
      "CTAs": [
        "ACCEPT",
        "REJECT"
      ]
    })
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
        // this.deleteNotification(notification);
        break;
      case "BUY_NOW":
        window.open("https://www.oneplay.in/subscription.html");
        break;
      case "ACCEPT":
        this.acceptFriendRequest();
        break;
      case "DOWNLOAD":
        window.open("https://www.oneplay.in/subscription.html");
        break;
      case "RENEW":
        break;
      case "RESET_PASSWORD":
        this.router.navigate(['/dashboard/settings/security']);
        break;
      case "RETRY":
        break;
    }
  }
  toggleNotificationActionBtn() {
    this.notification.showActionBtns = !this.notification.showActionBtns;
  }
  acceptFriendRequest() {
    this.restService.acceptFriend(this.notification.data?.friend_id).subscribe((response) => {

    }, (error: any)=> {

    });
  }
  markRead() {
    this.restService.markNotificationRead(this.notification.notificationId).subscribe({
      next: ()=> {
      }, error: ()=> {

      }
    })
  }
  markUnread() {
    this.restService.markNotificationUnRead(this.notification.notificationId).subscribe({
      next: ()=> {
      }, error: ()=> {
      }
    })
  }
}
