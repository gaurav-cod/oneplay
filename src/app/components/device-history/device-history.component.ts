import { Component, OnInit } from "@angular/core";
import { Session } from "src/app/models/session.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

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

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly ngbModal: NgbModal,
  ) {}

  ngOnInit(): void {
    this.restService.getSessions().subscribe((res) => {
      this.sessions = res;
      this.sessions.forEach((session) => {
        this.restService.getLocation(session.ip).subscribe((res) => {
          this.ipLocationMap[session.ip] = `${res.city}, ${res.country_name}`;
        });
      });
    });
  }

  getLocation(ip: string): [string, string] {
    let [state, country] = (this.ipLocationMap[ip] || ip).split(",");

    if (!country) country = "Unknown";

    return [state, country];
  }

  isActive(session: Session): boolean {
    return session.key === this.authService.sessionKey;
  }

  deleteSession(session: Session): void {
    this.loggingOut = true;
    this.logoutRef.close();
    this.restService.deleteSession(session.key).subscribe(
      () => {
        this.loggingOut = false;
        this.sessions = this.sessions.filter((s) => s.key !== session.key);
        if (session.key === this.authService.sessionKey) {
          this.authService.logout();
        }
      },
      (error) => {
        this.loggingOut = false;
        Swal.fire({
          icon: "error",
          title: "Error Code: " + error.code,
          text: error.message,
        });
      }
    );
  }

  logoutAll() {
    this.loggingOut = true;

    Promise.all(
      this.sessions.map(async (session) => {
        // if (!this.isActive(session)) {
          this.logoutRef.close();
          await this.restService.deleteSession(session.key).toPromise();
        // }
      })
    ).finally(() => {
      this.loggingOut = false;
      // this.sessions = this.sessions.filter((s) => this.isActive(s));
      window.location.href = '/dashboard/login';
    });
  }

  LogoutAlert(container) {
    this.logoutRef = this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }
}
