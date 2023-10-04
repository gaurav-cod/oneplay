import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { FriendModel } from "src/app/models/friend.model";
import { FriendsService } from "src/app/services/friends.service";

@Component({
  selector: "app-friends-main",
  templateUrl: "./friends-main.component.html",
  styleUrls: ["./friends-main.component.scss"],
})
export class FriendsMainComponent implements OnInit {
  @Output("toggle") toggle = new EventEmitter();
  @Output("goToParties") goToParties = new EventEmitter();
  @Output("goToMail") goToMail = new EventEmitter();
  @Output("goToChat") goToChat = new EventEmitter();
  @ViewChild("UnfriendModal") UnfriendModal: ElementRef<HTMLDivElement>;

  friends: FriendModel[] = [];
  requests = 0;

  private UnfriendModalRef: NgbModalRef;

  get onlineCount() {
    return this.friends.filter((friend) => friend.isOnline).length;
  }

  constructor(
    private readonly friendsService: FriendsService,
    private readonly ngbModal: NgbModal,
  ) {
    this.friendsService.friends.subscribe((friends) => {
      this.friends = friends;
    });
    this.friendsService.requests.subscribe((requests) => {
      this.requests = requests.length;
    });
  }

  ngOnInit(): void {}

  onChat(friend: FriendModel) {
    this.goToChat.emit(friend.id);
  }

  openUnfriendModal() {
    this.UnfriendModalRef = this.ngbModal.open(this.UnfriendModal, {
      centered: true,
      modalDialogClass: "modal-sm",
    });
  }
}
