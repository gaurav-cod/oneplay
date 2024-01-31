import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { FriendModel } from "src/app/models/friend.model";
import { CountlyService } from "src/app/services/countly.service";
import { FriendsService } from "src/app/services/friends.service";
import { RestService } from "src/app/services/rest.service";
import { memoize } from "src/app/utils/memoize.util";

@Component({
  selector: "app-friends-list",
  templateUrl: "./friends-list.component.html",
  styleUrls: ["./friends-list.component.scss"],
})
export class FriendsListComponent implements OnInit, OnDestroy {
  @Input() friends: FriendModel[];

  @Output() goToChat = new EventEmitter();

  private unreadSenders: string[] = [];
  private unreadSub: Subscription;

  constructor(
    private readonly ngbModal: NgbModal,
    private readonly restService: RestService,
    private readonly friendsService: FriendsService,
    private readonly countlyService: CountlyService
  ) {}

  ngOnInit(): void {
    
    this.unreadSub = this.friendsService.unreadSenders.subscribe(
      (ids) => (this.unreadSenders = ids)
    );
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
  }

  isUnread(friend: FriendModel) {
    return this.unreadSenders.includes(friend.user_id);
  }

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
    this.countlyService.updateEventData("chat", { "unfriendClicked": "yes" });
    this.restService
      .deleteFriend(friend.id)
      .subscribe(() => this.friendsService.deleteFriend(friend));
    c();
  }
}
