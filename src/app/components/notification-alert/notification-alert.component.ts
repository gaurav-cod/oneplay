import { Component, Host, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessagePayload } from 'firebase/messaging';
import { GameModel } from 'src/app/models/game.model';
import { FriendInterface, InvoiceInterface, NotificationModel, SubscriptionInterface } from 'src/app/models/notification.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { CountlyService } from 'src/app/services/countly.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestService } from 'src/app/services/rest.service';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';
import Swal from "sweetalert2";

@Component({
  selector: 'app-notification-alert',
  templateUrl: './notification-alert.component.html',
  styleUrls: ['./notification-alert.component.scss']
})
export class NotificationAlertComponent implements OnInit, OnDestroy {

  showNotificationContent: boolean = false;
  showSecondaryCTA: boolean = false;

  @Input() notification: NotificationModel;
  @Input() index: number = 0;

  private intervalRef: NodeJS.Timeout;

  constructor(
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly notificationService: NotificationService,
    private readonly gLink: GLinkPipe,
    private readonly countlyService: CountlyService,
    private readonly toastService: ToastService
  ) {
  }
  ngOnInit(): void {
    this.intervalRef = setTimeout(()=> {
      this.notificationService.removeNotification(this.index);
    }, 5000);
  }
  ngOnDestroy() {
    clearInterval(this.intervalRef);
  }

  @HostListener("mouseover") onHover() {
    clearInterval(this.intervalRef);
  }
  @HostListener("mouseleave") OnLeave() {
    clearInterval(this.intervalRef);
    this.intervalRef = setTimeout(()=> {
      this.notificationService.removeNotification(this.index);
    }, 5000);
  }

  toggleNotificationContent() {
    this.showNotificationContent = !this.showNotificationContent;
  }
  toggleSecondaryCTA(event) {
    this.showSecondaryCTA = !this.showSecondaryCTA;
    event.stopPropagation();
  }

  navigateByCTA(event, type: "RENEW" | "BUY_NOW" | "ACCEPT" | "RESET_PASSWORD" | "DOWNLOAD" | "RETRY" | "IGNORE" | "REJECT") {

    if (!(type == "ACCEPT" || type == "REJECT"))
      this.restService.markNotificationRead(this.notification.notificationId).toPromise();

    switch (type) {
      case "REJECT":
        this.removeFriendRequest();
        this.notificationService.removeNotification(this.index);
        break;
      case "IGNORE":
        this.notificationService.removeNotification(this.index);
        break;
      case "BUY_NOW":
        this.renewSubscription();
        break;
      case "ACCEPT":
        this.acceptFriendRequest();
        break;
      case "DOWNLOAD":
        this.notificationService.removeNotification(this.index);
        window.open((this.notification.data as InvoiceInterface)?.download_link);
        break;
      case "RENEW":
        this.checkoutPageOfPlan();
        break;
      case "RESET_PASSWORD":
        this.notificationService.removeNotification(this.index);
        this.router.navigate(['/settings/security']);
        break;
      case "RETRY":
        this.checkoutPageOfPlan();
        break;
    }
    event.stopPropagation();
  }

  messageClicked() {

    if (this.notification.subType !== "FRIEND_REQUEST")
      this.restService.markNotificationRead(this.notification.notificationId).toPromise();

    switch (this.notification.subType) {
      case "WELCOME_MESSAGE":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
        break;
      case "SCHEDULED_MAINTENANCE":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
        break;
      case "SUBSCRIPTION_EXPIRING":
      case "SUBSCRIPTION_EXPIRED":
        this.renewSubscription();
        break;
      case "LIMITED_TOKEN_REMAIN":
        this.renewSubscription();
        break;
      case "NEW_GAMES_AVAILABLE":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
        break;
      case "GAME_UPDATE_AVAILABLE":
        this.router.navigate(['']);
        // this.viewBannerGame(this.notification.data);
        break;
      case "DISCOUNT_OFFER":
        break;
      case "PASSWORD_CHANGE":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
        break;
      case "UNUSUAL_ACCOUNT_ACTIVITY":
        this.router.navigate(['/settings/security']);
        this.notificationService.removeNotification(this.index);
        break;
      case "PAYMENT_FAILED":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
        break;
      case "PAYMENT_SUCCESS":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
        break;
      case "FRIEND_REQUEST":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
        break;
      case "SCHEDULED_MAINTENANCE":
        this.router.navigate(['']);
        this.notificationService.removeNotification(this.index);
      default:
        this.router.navigate(['']);
    }
  }

  viewBannerGame(game: GameModel) {
    this.countlyService.startEvent("gameLandingView", {
      data: { source: 'homePage', trigger: 'banner' }, // need to change source
      discardOldData: true,
    });
    this.router.navigate(['view', this.gLink.transform(game)]);
  }
  toggleNotificationActionBtn() {
    this.notification.showActionBtns = !this.notification.showActionBtns;
  }
  checkoutPageOfPlan() {
    this.router.navigate([`/checkout/${(this.notification.data as SubscriptionInterface).subscription_package_id}`]);
  }
  renewSubscription() {
    this.restService.getCurrentSubscription().subscribe({
      next: (response) => {
        if (response?.length === 0) {
          window.open(environment.domain + '/subscription.html', '_self');
        } else {
          this.router.navigate(['/settings/subscription']);
        }
        this.notificationService.removeNotification(this.index);
      }, error: (err) => {
        Swal.fire({
          icon: "error",
          title: "Error Code: " + err.code,
          text: err.message,
        });
      }
    })
  }

  removeFriendRequest() {
    this.restService.deleteFriend((this.notification.data as FriendInterface)?.friend_request_id).subscribe((response) => {
      // this.toastService.show(`You are now friends with ${this.notification.data?.friend_name}`, {
      //   classname: `bg-gray-dark text-white`,
      //   delay: 4000,
      // });
      this.notificationService.removeNotification(this.index);
    });
  }
  acceptFriendRequest() {

    this.restService.acceptFriend((this.notification.data as FriendInterface)?.friend_request_id).subscribe((response) => {
      this.notificationService.removeNotification(this.index);

      this.toastService.show(`You are now friends with ${(this.notification.data as FriendInterface)?.friend_name}`, {
        classname: `bg-gray-dark text-white`,
        delay: 4000,
      });
    });
  }
  markRead() {
    this.restService.markNotificationRead(this.notification.notificationId).subscribe({
      next: () => {
        this.notificationService.removeNotification(this.index);
      }, error: (error) => {
      }
    })
  }
  markUnread() {
    this.restService.markNotificationUnRead(this.notification.notificationId).subscribe({
      next: () => {
        this.notificationService.removeNotification(this.index);
      }, error: (error) => {
      }
    })
  }
}
