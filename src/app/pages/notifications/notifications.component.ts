import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceInterface, NotificationModel } from 'src/app/models/notification.model';
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
  loading: boolean = false;

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

  @HostListener('click', ['$event'])
  clickout(event) {
    if (!event.target.className.includes("three-dot")) {
      this.userNotificationList.forEach((notification)=> notification.showActionBtns = false);
    }
  }

  ngOnInit(): void {
    this.restService.markNotificationsSeen().toPromise();
    this.activatedRoute.queryParams.subscribe((qParam)=> {
      this.previousPage = qParam['previousPage'];
    })
    this.loading = true;
    this.restService.getAllUserNotifications(this.currentPage, this.pageLimit).subscribe((response)=> {
      this.userNotificationList = response.notifications;
      this.loadMoreBtn = this.userNotificationList.length < response.total;
      this.currentPage++;
      this.loading = false;
    }, (error: any)=> {
      this.loading = false;
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

  notificationAction(event, notification: any) {

    switch (notification.subType) {
      case "WELCOME_MESSAGE":
        this.router.navigate(['']);
        break;
      case "SCHEDULED_MAINTENANCE":
        this.router.navigate(['']);
        break;
      case "SUBSCRIPTION_EXPIRING":
      case "SUBSCRIPTION_EXPIRED":
      case "LIMITED_TOKEN_REMAIN":
        this.router.navigate(['/settings/subscription']);
        break;
      case "NEW_GAMES_AVAILABLE":
        this.router.navigate(['']);
        break;
      case "GAME_UPDATE_AVAILABLE":
        this.router.navigate(['']);
        break;
      case "PASSWORD_CHANGE":
        this.router.navigate(['']);
        break;
      case "UNUSUAL_ACCOUNT_ACTIVITY":
        this.router.navigate(['/settings/security']);
        break;
      case "PAYMENT_FAILED":
        this.checkoutPageOfPlan(notification);
        break;
      case "PAYMENT_SUCCESS":
        this.router.navigate(['']);
        break;
      case "FRIEND_REQUEST":
        this.router.navigate(['/notifications'], { queryParams: { previousPage: 'settings' } });
        break;
      case "SCHEDULED_MAINTENANCE":
        this.router.navigate(['']);
      default:
        this.router.navigate(['']);

      event.stopPropagation();
    }
  }
  
  navigateByCTA(event, type: "RENEW" | "BUY_NOW" | "ACCEPT" | "RESET_PASSWORD" | "DOWNLOAD" | "RETRY" | "IGNORE" | "REJECT", notification: NotificationModel) {
    
    if (!(type == "ACCEPT" || type == "REJECT" || type == "IGNORE"))
      this.restService.markNotificationRead(notification.notificationId).toPromise();

    switch (type) {
      case "REJECT":
        this.removeFriendRequest(notification);
        break;
      case "IGNORE":
        this.deleteNotification(notification);
        break;
      case "BUY_NOW":
        window.open(environment.domain + '/subscription.html', '_self');
        break;
      case "ACCEPT":
        this.acceptFriendRequest(notification);
        break;
      case "DOWNLOAD":
        notification.isRead = true;
        this.downloadInvoice((notification.data as InvoiceInterface)?.download_link);
        break;
      case "RENEW":
        if (notification.subType === "SUBSCRIPTION_EXPIRING")
          this.checkoutPageOfPlan(notification);
        else
          this.renewSubscription(notification);
        break;
      case "RESET_PASSWORD":
        this.router.navigate(['/settings/security'], {queryParams: {dialogType: 'RESET_PASS'}});
        break;
      case "RETRY":
        this.checkoutPageOfPlan(notification);
        break;
    }
    event.stopPropagation();
  }

  downloadInvoice(downloadLink: string) {
    this.restService.downloadPDF(downloadLink).subscribe((response)=> {
      window.open(downloadLink, "_self");
    }, (error)=> {
      Swal.fire({
        imageUrl: "assets/img/swal-icon/Group.svg",
        text: "Oops! There was an issue generating the invoice.",
        confirmButtonText: "Okay"
      });
    })
  }

  checkoutPageOfPlan(notifiaction) {
    this.router.navigate([`/checkout/${notifiaction.data.subscription_package_id}`]);
  }
  renewSubscription(notifiaction) {
    
        let plan = '10800';
        if (notifiaction.data?.offered_tokens <= 60) {
          plan = '60';
        } else if (notifiaction.data?.offered_tokens <= 180) {
          plan = '180';
        } else if (notifiaction.data?.offered_tokens <= 300) {
          plan = '300';
        } else if (notifiaction.data?.offered_tokens <= 600) {
          plan = '600';
        } else if (notifiaction.data?.offered_tokens <= 1200) {
          plan = '1200';
        } else {
          plan = '10800';
        }
        
        window.open(environment.domain + `/subscription.html?plan=${plan}`, '_self');

  }

  toggleNotificationActionBtn(event, notificationDetail) {
    event.stopPropagation();
    notificationDetail.showActionBtns = !notificationDetail.showActionBtns;
    this.userNotificationList.forEach((notification)=> {
      if (notification.notificationId != notificationDetail.notificationId)
        notification.showActionBtns = false;
    })
  }
  acceptFriendRequest(notification) {
    this.restService.acceptFriend(notification.data?.friend_request_id).subscribe((response) => {
      this.userNotificationList = this.userNotificationList.filter((notify: NotificationModel)=> notify.notificationId != notification.notificationId);

      this.toastService.show(`You are now friends with ${notification.data?.friend_name}`, {
        classname: `bg-gray-dark text-white`,
        delay: 4000,
      });
    }, (error: any)=> {

    });
  }
  removeFriendRequest(notification) {
    this.restService.deleteFriend(notification.data?.friend_request_id).subscribe((response) => {
      // this.toastService.show(`You are now friends with ${notification.data?.friend_name}`, {
      //   classname: `bg-gray-dark text-white`,
      //   delay: 4000,
      // });
      this.userNotificationList = this.userNotificationList.filter((notify: NotificationModel)=> notify.notificationId != notification.notificationId);
      
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
  markRead(event, notification) {
    event.stopPropagation();
    this.restService.markNotificationRead(notification.notificationId).subscribe({
      next: ()=> {
        notification.isRead = true;
        notification.showActionBtns = false;
      }, error: ()=> {
      }
    })
  }
  markUnread(event, notification) {
    event.stopPropagation();
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
