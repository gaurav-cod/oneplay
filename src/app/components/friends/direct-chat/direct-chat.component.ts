import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { FriendModel } from "src/app/models/friend.model";
import { MessageModel } from "src/app/models/message.model";
import { Gender, UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { ChatService } from "src/app/services/chat.service";
import { FriendsService } from "src/app/services/friends.service";
import { RestService } from "src/app/services/rest.service";
import * as moment from "moment";
import { EmojiEvent } from "@ctrl/ngx-emoji-mart/ngx-emoji";
import { UNSUPPORTED_EMOJIS } from "src/app/variables/unsupported-emojis";

@Component({
  selector: "app-direct-chat",
  templateUrl: "./direct-chat.component.html",
  styleUrls: ["./direct-chat.component.scss"],
})
export class DirectChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input("friendId") friendId: string;
  @Output("goBack") goBack = new EventEmitter();

  @ViewChild("chatBox") chatBox: ElementRef<HTMLUListElement>;
  @ViewChild("textarea") textarea: ElementRef<HTMLTextAreaElement>;
  @ViewChild("textHeight") textHeight: ElementRef<HTMLDivElement>;

  messages: MessageModel[] = [];
  message = new UntypedFormControl("", Validators.required);
  user: UserModel = {} as UserModel;
  friend: FriendModel = {} as FriendModel;
  showEmoji = false;

  private loadMoreHeight: number = 0;
  private userSub: Subscription;
  private messageSub1: Subscription;
  private messageSub2: Subscription;
  private messageChangesSub: Subscription;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly friendsService: FriendsService,
    private readonly restService: RestService
  ) {
    this.userSub = this.authService.user.subscribe(
      (user) => (this.user = user)
    );
    this.messageSub1 = this.chatService.messages$.subscribe((messages) => {
      this.messages = messages;
    });
  }

  // Unsubscribption not required
  @HostListener('click', ['$event'])
  clickout(event) {
    
    if (!event.target.className.includes('emoji-mart-icon')) {
      this.showEmoji = false;
    }
  }

  ngOnInit(): void {
    this.friend = this.friendsService.getFriendById(this.friendId);
    this.chatService.loadMessages(this.friend.user_id);
    this.chatService.handleConnect(this.friend.user_id);
    this.restService
      .getOnlineStatus(this.friend.user_id)
      .toPromise()
      .then((status) => {
        this.friendsService.updateOnlineStatus(this.friend, status);
        this.friend = this.friend.copyWith({ isOnline: status });
      });
  }

  ngOnDestroy(): void {
    this.chatService.handleDisconnect();
    this.userSub?.unsubscribe();
    this.messageSub1?.unsubscribe();
    this.messageSub2?.unsubscribe();
    this.messageChangesSub?.unsubscribe();
    this.messages = [];
  }

  ngAfterViewInit(): void {
    this.messageSub2 = this.chatService.messages$.subscribe((msg) => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 10);
    });
    this.messageChangesSub = this.message.valueChanges.subscribe((text) => {
      this.textHeight.nativeElement.innerText = text;
      this.textarea.nativeElement.style.height = this.textHeight.nativeElement.scrollHeight + "px";
    });
  }

  get defaultImage() {
    return (
      "assets/img/singup-login/" +
      (this.friend?.gender ?? Gender.Unknown) +
      ".svg"
    );
  }

  get emojiBottom() {
    const tHeight = this.textarea.nativeElement?.scrollHeight ?? 44;
    return `calc(${tHeight}px + 1rem)`;
  }

  get canLoadMore() {
    return this.chatService.canLoadMore;
  }

  get loading() {
    return this.chatService.loading;
  }

  isSameDate(index: number) {
    if (index === 0) {
      return false;
    }
    const moment1 = moment(this.messages[index].createdAt);
    const moment2 = moment(this.messages[index - 1].createdAt);
    return moment1.isSame(moment2, "day");
  }

  getDate(msg: MessageModel) {
    const moment1 = moment(msg.createdAt);
    const moment2 = moment(new Date());
    if (moment1.isSame(moment2, "day")) {
      return "Today";
    } else if (moment1.isSame(moment2.subtract(1, "day"), "day")) {
      return "Yesterday";
    } else {
      return moment1.format("DD/MM/yyyy");
    }
  }

  loadMore() {
    this.loadMoreHeight = this.chatBox.nativeElement.scrollHeight;
    this.chatService.loadMore(this.friend.user_id);
  }

  onImgError(event) {
    event.target.src = this.defaultImage;
  }

  sendMessage() {
    this.showEmoji = false;
    if (this.message.valid) {
      this.chatService.sendMessage(this.message.value, this.friend.user_id);
      this.message.reset();
    }
  }

  getSenderName(message: MessageModel) {
    if (message.sender === this.friend.user_id) {
      return this.friend.first_name + " " + this.friend.last_name;
    }
    return this.user.firstName + " " + this.user.lastName;
  }

  isUserSender(message: MessageModel) {
    return message.sender === this.user.id;
  }

  toggleEmoji() {
    this.showEmoji = !this.showEmoji;
  }

  selectEmoji(event: EmojiEvent) {
    this.message.setValue(
      (this.message.value ?? "") + (event.emoji.native ?? "")
    );
  }
  
  isMissingEmoji(data: string) {
    return !UNSUPPORTED_EMOJIS.includes(data);
  }

  onInput(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    this.chatBox.nativeElement.scrollTop =
      this.chatBox.nativeElement.scrollHeight - this.loadMoreHeight;
    this.loadMoreHeight = 0;
  }
}
