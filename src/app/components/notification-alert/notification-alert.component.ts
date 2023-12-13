import { Component, Host, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameModel } from 'src/app/models/game.model';
import { NotificationModel } from 'src/app/models/notification.model';
import { GLinkPipe } from 'src/app/pipes/glink.pipe';
import { CountlyService } from 'src/app/services/countly.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RestService } from 'src/app/services/rest.service';
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

  @Input() notification: any;
  private intervalRef: NodeJS.Timeout;

  constructor(
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly notificationService: NotificationService,
    private readonly gLink: GLinkPipe,
    private readonly countlyService: CountlyService
  ) {
  }
  ngOnInit(): void {
    this.notification = {
      ...this.notification,
      showActionBtns: false
    }
    this.intervalRef = setTimeout(()=> {
      this.notificationService.setShowAlertNotification(false);
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
      this.notificationService.setShowAlertNotification(false);
    }, 5000);
  }

  toggleNotificationContent() {
    this.showNotificationContent = !this.showNotificationContent;
  }
  toggleSecondaryCTA() {
    this.showSecondaryCTA = !this.showSecondaryCTA;
  }

  navigateByCTA(type: "RENEW" | "BUY_NOW" | "ACCEPT" | "RESET_PASSWORD" | "DOWNLOAD" | "RETRY" | "IGNORE" | "REJECT") {
    
    switch (type) {
      case "REJECT":
      case "IGNORE":
        this.notificationService.setShowAlertNotification(false);
        break;
      case "BUY_NOW":
        this.checkoutPageOfPlan();
        break;
      case "ACCEPT":
        this.acceptFriendRequest();
        break;
      case "DOWNLOAD":
        this.notificationService.setShowAlertNotification(false);
        window.open(this.notification.data?.download_link);
        break;
      case "RENEW":
        this.checkoutPageOfPlan();
        break;
      case "RESET_PASSWORD":
        this.notificationService.setShowAlertNotification(false);
        this.router.navigate(['/settings/security']);
        break;
      case "RETRY":
        this.checkoutPageOfPlan();
        break;
    }
  }

  messageClicked() {
  
    switch (this.notification.subType) {
      case "WELCOME_MESSAGE":
        break;
      case "SCHEDULED_MAINTENANCE":
        this.router.navigate(['']);
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
        break;
      case "GAME_UPDATE_AVAILABLE":
        this.router.navigate(['']);
        // this.viewBannerGame(this.notification.data);
        break;
      case "DISCOUNT_OFFER":
        break;
      case "PASSWORD_CHANGE":
        this.router.navigate(['']);
        break;
      case "UNUSUAL_ACCOUNT_ACTIVITY":
        this.router.navigate(['/settings/security']);
        break;
      case "PAYMENT_FAILED":
        this.router.navigate(['']);
        break;
      case "PAYMENT_SUCCESS":
        this.router.navigate(['']);
        break;
      case "FRIEND_REQUEST":
        this.router.navigate(['']);
        this.notificationService.setShowAlertNotification(false);
        break;
      case "SCHEDULED_MAINTENANCE":
        this.router.navigate(['']);
        this.notificationService.setShowAlertNotification(false);
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
    this.router.navigate([`/checkout/${this.notification.data.subscription_id}`]);
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
      // Swal.fire({
      //   icon: "error",
      //   title: "Error Code: " + error.code,
      //   text: error.message,
      // });
    });
  }
  markRead() {
    this.restService.markNotificationRead(this.notification.notificationId).subscribe({
      next: () => {
        this.notificationService.setShowAlertNotification(false);
      }, error: (error) => {
        // Swal.fire({
        //   icon: "error",
        //   title: "Error Code: " + error.code,
        //   text: error.message,
        // });
      }
    })
  }
  markUnread() {
    this.restService.markNotificationUnRead(this.notification.notificationId).subscribe({
      next: () => {
        this.notificationService.setShowAlertNotification(false);
      }, error: (error) => {
        // Swal.fire({
        //   icon: "error",
        //   title: "Error Code: " + error.code,
        //   text: error.message,
        // });
      }
    })
  }
}
