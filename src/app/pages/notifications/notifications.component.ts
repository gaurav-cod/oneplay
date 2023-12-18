import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationModel } from 'src/app/models/notification.model';
import { RestService } from 'src/app/services/rest.service';
import { environment } from 'src/environments/environment';
import Swal from "sweetalert2";
import * as moment from "moment";
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  
  
  userNotificationList: NotificationModel[] = [];

  currentPage: number = 0;
  pageLimit: number = 5;
  loadMoreBtn: boolean = true;
  private previousPage: string = "home";
  
  constructor(
    private readonly restService: RestService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.restService.markNotificationsSeen().toPromise();
    this.activatedRoute.queryParams.subscribe((qParam)=> {
      this.previousPage = qParam['previousPage'];
    })
    this.restService.getAllUserNotifications(this.currentPage, this.pageLimit).subscribe((response)=> {
      this.userNotificationList = response.notifications;
      this.loadMoreBtn = this.userNotificationList.length < response.total;
      this.currentPage++;
    }, (error: any)=> {
    })
  }

  
  loadMore() {
    this.restService
      .getAllUserNotifications(this.currentPage, this.pageLimit)
      .subscribe({
        next: (data) => {
          this.userNotificationList = [...this.userNotificationList, ...data.notifications];
          this.currentPage++;
          this.loadMoreBtn = this.userNotificationList.length < data.total;
        }
      });
  }
  
  navigateByCTA(type: "RENEW" | "BUY_NOW" | "ACCEPT" | "RESET_PASSWORD" | "DOWNLOAD" | "RETRY" | "IGNORE" | "REJECT", notification: NotificationModel) {
    
    this.restService.markNotificationRead(notification.notificationId).toPromise();

    switch (type) {
      case "REJECT":
      case "IGNORE":
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
      this.toastService.show(`You are now friends with ${notification.data?.friend_name}`, {
        classname: `bg-gray-dark text-white`,
        delay: 4000,
      });
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
  goBack() {
    let redirectURL = "";
    switch(this.previousPage) {
      case "store":
        redirectURL = "/store";
        break;
      case "streams":
        redirectURL = "/streams";
        break;
      case "wishlist":
        redirectURL = "/wishlist";
        break;
      case "settings":
        redirectURL = "/settings/profile"
        break;
      case "search":
        redirectURL = "/search"
        break;
      default: 
        redirectURL = "/home";
    }
    this.router.navigate([redirectURL]);
  }
}
