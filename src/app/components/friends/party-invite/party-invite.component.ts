import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FriendModel } from "src/app/models/friend.model";
import { PartyInviteModel } from "src/app/models/partyInvite.model";
import { FriendsService } from "src/app/services/friends.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-party-invite",
  templateUrl: "./party-invite.component.html",
  styleUrls: ["./party-invite.component.scss"],
})
export class PartyInviteComponent implements OnInit, OnDestroy {
  @Input("partyId") partyId: string;
  @Output("goBack") goBack = new EventEmitter();

  friends: FriendModel[] = [];
  invites: PartyInviteModel[] = [];

  constructor(
    private readonly friendsService: FriendsService,
    private readonly restService: RestService
  ) {
    this.friendsService.friends.subscribe((friends) => {
      this.friends = friends;
    });
  }

  ngOnInit(): void {
    this.restService
      .getPartyInvitesByGroupId(this.partyId)
      .subscribe((invites) => {
        this.invites = invites;
      });
  }

  ngOnDestroy(): void {
    this.invites = [];
    Swal.close();
  }

  isInvited(friend: FriendModel): boolean {
    return this.invites.some((invite) => invite.userId === friend.user_id);
  }

  onInvite(friend: FriendModel): void {
    this.restService.inviteToParty(this.partyId, friend.user_id).subscribe(
      (invite) => {
        this.invites = [...this.invites, invite];
      },
      (error) => {
        Swal.fire({
          title: "Error Code: " + error.code,
          text: error.message,
          icon: "error",
        });
      }
    );
  }
}
