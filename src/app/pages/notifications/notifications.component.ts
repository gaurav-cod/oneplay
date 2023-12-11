import { Component, OnInit } from '@angular/core';
import { NotificationModel } from 'src/app/models/notification.model';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  constructor(
    private restService: RestService
  ) {}

  userNotificationList: NotificationModel[] = [];
  ngOnInit(): void {
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
