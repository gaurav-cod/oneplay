import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { PartyInviteModel } from "src/app/models/partyInvite.model";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-invites",
  templateUrl: "./invites.component.html",
  styleUrls: ["./invites.component.scss"],
})
export class InvitesComponent implements OnInit {
  @Output("goBack") goBack = new EventEmitter();

  requests: PartyInviteModel[] = [];

  constructor(
    private readonly partyService: PartyService,
    private readonly restService: RestService
  ) {
    this.partyService.invites.subscribe((requests) => {
      this.requests = requests;
    });
  }

  ngOnInit(): void {}

  accept(invite: PartyInviteModel) {
    this.restService.acceptPartyInvite(invite.party.id).subscribe(
      () => {
        this.partyService.acceptInvite(invite);
      },
      (err) => this.showError(err)
    );
  }

  decline(invite: PartyInviteModel) {
    this.restService.rejectPartyInvite(invite.party.id).subscribe(
      () => {
        this.partyService.rejectInvite(invite);
      },
      (err) => this.showError(err)
    );
  }

  private showError(error) {
    Swal.fire({
      icon: "error",
      title: "Error Code: " + error.code,
      text: error.message,
    });
  }
}
