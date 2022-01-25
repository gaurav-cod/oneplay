import { Component, OnInit } from "@angular/core";
import { Session } from "src/app/models/session.model";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-basic-info",
  templateUrl: "./basic-info.component.html",
  styleUrls: ["./basic-info.component.scss"],
})
export class BasicInfoComponent implements OnInit {
  sessions: Session[] = [];
  ipLocationMap: { [key: string]: string } = {};
  loggingOut: boolean = false;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.restService.getSessions().subscribe((res) => {
      this.sessions = res;
      this.sessions.forEach((session) => {
        this.restService.getLocation(session.ip).subscribe((res) => {
          this.ipLocationMap[session.ip] = res;
        });
      });
    });
  }

  isActive(session: Session): boolean {
    return session.key === this.authService.sessionKey;
  }

  deleteSession(session: Session): void {
    this.loggingOut = true;
    this.restService.deleteSession(session.key).subscribe(
      () => {
        this.loggingOut = false;
        this.sessions = this.sessions.filter((s) => s.key !== session.key);
      },
      (error) => {
        this.loggingOut = false;
        alert(error);
      }
    );
  }
}
