import { Component, OnInit } from "@angular/core";
import { Session } from "src/app/models/session.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { MessagingService } from "src/app/services/messaging.service";
import { CountlyService } from "src/app/services/countly.service";

@Component({
  selector: "app-device-history",
  templateUrl: "./device-history.component.html",
  styleUrls: ["./device-history.component.scss"],
})
export class DeviceHistoryComponent implements OnInit {
  sessions: Session[] = [];
  ipLocationMap: { [key: string]: string } = {};
  loggingOut: boolean = false;
  private logoutRef: NgbModalRef;
  private logoutSession: Session;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly messagingService: MessagingService,
    private readonly ngbModal: NgbModal,
    private readonly countlyService: CountlyService,
  ) { }

  ngOnInit(): void {
    this.countlyService.updateEventData("settingsView", {
      deviceHistoryViewed: 'yes',
    })
    this.restService.getSessions().subscribe((res) => (this.sessions = res));
  }

  isActive(session: Session): boolean {
    return session.key === this.authService.sessionKey;
  }

  async deleteSession() {
    if (!this.logoutSession) {
      return;
    }

    this.loggingOut = true;
    this.logoutRef.close();

    if (this.isActive(this.logoutSession)) {
      this.messagingService.removeToken();
    }
    this.restService.deleteSession(this.logoutSession.key).subscribe(
      () => {
        this.loggingOut = false;
        this.sessions = this.sessions.filter(
          (s) => s.key !== this.logoutSession.key
        );
        if (this.isActive(this.logoutSession)) {
          this.authService.loggedOutByUser = true;
          this.authService.logout();
        }
      },
      (error) => {
        this.loggingOut = false;
        this.showError(error);
      }
    );
  }

  logoutAll() {
    this.loggingOut = true;

    this.countlyService.updateEventData("settingsView", {
      logoutFromAllClicked: "yes",
    });

    Promise.all(
      this.sessions.map(async (session) => {
        if (!this.isActive(session)) {
          this.logoutRef.close();
          await this.restService.deleteSession(session.key).toPromise();
        }
      })
    ).finally(() => {
      this.messagingService.removeToken();
      this.restService
        .deleteSession(this.authService.sessionKey)
        .toPromise()
        .finally(() => {
          this.loggingOut = false;
          window.location.href = "/dashboard/login";
        });
    });
  }

  logoutAlert(container, session?: Session) {
    this.logoutSession = session;
    this.logoutRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  showError(error) {
    Swal.fire({
      title: error.data.title,
      text: error.data.message,
      imageUrl: error.data.icon,
      confirmButtonText: error.data.primary_CTA,
      showCancelButton: error.data.showSecondaryCTA,
      cancelButtonText: error.data.secondary_CTA
    }).then((response) => {
      if (response.isConfirmed && error.data.primary_CTA?.includes("Login")) {
        window.location.href = "/dashboard/login";
      }
    })
  }
}
