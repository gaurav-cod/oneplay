import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationModel } from 'src/app/models/notification.model';
import { RestService } from 'src/app/services/rest.service';
import { environment } from 'src/environments/environment';

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
        window.open(environment.domain + "/subscription.html");
        break;
      case "ACCEPT":
        this.acceptFriendRequest(notification);
        break;
      case "DOWNLOAD":
        window.open(environment.domain + "/subscription.html");
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
  toggleNotificationActionBtn(notificationDetail) {
    notificationDetail.showActionBtns = !notificationDetail.showActionBtns;
  }
  acceptFriendRequest(notification) {
    this.restService.acceptFriend(notification.data?.friend_id).subscribe((response) => {

    }, (error: any)=> {

    });
  }
  deleteNotification(notification) {
    this.restService.deleteNotification(notification.notificationId).subscribe({
      next: ()=> {
        this.userNotificationList = this.userNotificationList.filter((notificationData: any)=> notificationData.notificationId != notification.notificationId)
        notification.showActionBtns = false;
      }, error: ()=> {

      }
    })
  }
  markRead(notification) {
    this.restService.markNotificationRead(notification.notificationId).subscribe({
      next: ()=> {
        notification.isRead = true;
        notification.showActionBtns = false;
      }, error: ()=> {

      }
    })
  }
  markUnread(notification) {
    this.restService.markNotificationUnRead(notification.notificationId).subscribe({
      next: ()=> {
        notification.isRead = false;
        notification.showActionBtns = false;
      }, error: ()=> {
      }
    })
  }
}
