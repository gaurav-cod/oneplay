import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-friends-list",
  templateUrl: "./friends-list.component.html",
  styleUrls: ["./friends-list.component.scss"],
})
export class FriendsListComponent {
  @Input() friends: FriendModel[];

  @Output() goToChat = new EventEmitter();

  constructor(
    private readonly ngbModal: NgbModal,
    private readonly restService: RestService,
    private readonly friendsService: FriendsService
  ) {}

  onChat(friend: FriendModel) {
    this.goToChat.emit(friend.id);
  }

  openUnfriendModal(container) {
    this.ngbModal.open(container, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }

  getGenderImage(friend: FriendModel) {
    return "assets/img/singup-login/" + friend.gender + ".svg";
  }

  onImgError(event, friend: FriendModel) {
    event.target.src = this.getGenderImage(friend);
  }

  unfriend(friend: FriendModel, c) {
    this.restService
      .deleteFriend(friend.id)
      .subscribe(() => this.friendsService.deleteFriend(friend));
    c();
  }
}
