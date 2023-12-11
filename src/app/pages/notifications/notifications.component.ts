import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationModel } from 'src/app/models/notification.model';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  constructor(
    private restService: RestService,
    private router: Router
  ) {}

  userNotificationList: NotificationModel[] = [];
  ngOnInit(): void {
    this.restService.markNotificationsSeen().toPromise();
    this.restService.getAllUserNotifications(0, 10).subscribe((response: any)=> {
      this.userNotificationList = response.map((res: any)=> {
        return {
          ...res,
          showActionBtns: false
        }
      });
    }, (error: any)=> {
    })
  }

  navigateByCTA(type: "RENEW" | "BUY_NOW" | "ACCEPT" | "RESET_PASSWORD" | "DOWNLOAD" | "RETRY" | "IGNORE" | "REJECT", notification: NotificationModel) {
    switch (type) {
      case "REJECT" || "IGNORE":
        this.deleteNotification(notification);
        break;
      case "BUY_NOW":
        break;
      case "ACCEPT":
        break;
      case "DOWNLOAD":
        break;
      case "RENEW":
        window.open("https://www.oneplay.in/subscription.html");
        break;
      case "RESET_PASSWORD":
        break;
      case "RETRY":
        break;
    }
  }
  toggleNotificationActionBtn(notificationDetail) {
    notificationDetail.showActionBtns = !notificationDetail.showActionBtns;
  }
  deleteNotification(notification) {
    this.restService.deleteNotification(notification.notificationId).subscribe({
      next: ()=> {
        
      }, error: ()=> {

      }
    })
  }
  markRead(notification) {
    this.restService.markNotificationRead(notification.notificationId).subscribe({
      next: ()=> {
        notification.isRead = true;
      }, error: ()=> {

      }
    })
  }
  markUnread(notification) {
    this.restService.markNotificationUnRead(notification.notificationId).subscribe({
      next: ()=> {
        notification.isRead = false;
      }, error: ()=> {
      }
    })
  }
}
