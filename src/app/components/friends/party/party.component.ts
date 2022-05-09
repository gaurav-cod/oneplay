import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { PartyModel } from "src/app/models/party.model";
import { PartyMemberModel } from "src/app/models/partyMember.model";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-party",
  templateUrl: "./party.component.html",
  styleUrls: ["./party.component.scss"],
})
export class PartyComponent implements OnInit, OnDestroy {
  @Input("partyId") partyId: string;
  @Output("goBack") goBack = new EventEmitter();
  @Output("goToPartySettings") goToPartySettings = new EventEmitter<string>();
  @Output("goToPartyInvite") goToPartyInvite = new EventEmitter<string>();

  members: PartyMemberModel[] = [];
  user: UserModel;
  party: PartyModel;

  get isCreator() {
    return this.user?.id === this.party?.createdBy;
  }

  get isAdmin() {
    return this.members.some(
      (member) => member.user.id === this.user?.id && member.role === "admin"
    );
  }

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly partyService: PartyService
  ) {
    this.authService.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    this.party = this.partyService.getParty(this.partyId);
    this.restService.getPartyMembers(this.party.id).subscribe((members) => {
      this.members = members;
    });
  }

  ngOnDestroy(): void {
    this.members = [];
  }

  onClickPartySettings() {
    this.goToPartySettings.emit(this.party.id);
  }

  onClickInvite() {
    this.goToPartyInvite.emit(this.party.id);
  }
}
