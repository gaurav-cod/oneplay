import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationModel } from 'src/app/models/notification.model';
import { RestService } from 'src/app/services/rest.service';
import { environment } from 'src/environments/environment';
import Swal from "sweetalert2";
import * as moment from "moment";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  
  
  userNotificationList: any = {};

  currentPage: number = 0;
  pageLimit: number = 5;
  loadMoreBtn: boolean = true;
  
  constructor(
    private restService: RestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.restService.markNotificationsSeen().toPromise();
    this.restService.getAllUserNotifications(this.currentPage, this.pageLimit).subscribe((response: any)=> {
      this.userNotificationList = response.map((res: any)=> {
        return {
          ...res,
          showActionBtns: false
        }
      });
      if (response.length < this.pageLimit) {
        this.loadMoreBtn = true;
      }
      this.currentPage++;
    }, (error: any)=> {
    })
  }

  
  loadMore() {
    this.restService
      .getAllUserNotifications(this.currentPage, this.pageLimit)
      .subscribe({
        next: (data) => {
          this.userNotificationList = [...this.userNotificationList, ...data];
          this.currentPage++;
          if (data.length < this.pageLimit) {
            this.loadMoreBtn = true;
          }
        }
      });
  }
  
  navigateByCTA(type: "RENEW" | "BUY_NOW" | "ACCEPT" | "RESET_PASSWORD" | "DOWNLOAD" | "RETRY" | "IGNORE" | "REJECT", notification: NotificationModel) {
    switch (type) {
      case "REJECT" || "IGNORE":
        this.deleteNotification(notification);
        break;
      case "BUY_NOW":
        this.checkoutPageOfPlan(notification);
        break;
      case "ACCEPT":
        this.acceptFriendRequest(notification);
        break;
      case "DOWNLOAD":
        window.open(environment.domain + "/subscription.html");
        break;
      case "RENEW":
        this.checkoutPageOfPlan(notification);
        break;
      case "RESET_PASSWORD":
        this.router.navigate(['/settings/security']);
        break;
      case "RETRY":
        this.checkoutPageOfPlan(notification);
        break;
    }
  }

  checkoutPageOfPlan(notifiaction) {
    this.router.navigate([`/checkout/${notifiaction.data.subscription_id}`]);
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

  isSameDate(index: number) {
    if (index === 0) {
      return false;
    }
    debugger;
    const moment1 = moment(this.userNotificationList[index].createdAt);
    const moment2 = moment(this.userNotificationList[index - 1].createdAt);
    return moment1.isSame(moment2, "day");
  }

  getDate(notifiaction: NotificationModel) {
    const moment1 = moment(notifiaction.createdAt);
    const moment2 = moment(new Date());
    if (moment1.isSame(moment2, "day")) {
      return "Today";
    } else if (moment1.isSame(moment2.subtract(1, "day"), "day")) {
      return "Yesterday";
    } else {
      return moment1.format("DD/MM/yyyy");
    }
  }
}
