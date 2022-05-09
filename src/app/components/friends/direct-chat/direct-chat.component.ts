import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { FriendModel } from "src/app/models/friend.model";
import { MessageModel } from "src/app/models/message.model";
import { UserModel } from "src/app/models/user.model";
import { AuthService } from "src/app/services/auth.service";
import { ChatService } from "src/app/services/chat.service";

@Component({
  selector: "app-direct-chat",
  templateUrl: "./direct-chat.component.html",
  styleUrls: ["./direct-chat.component.scss"],
})
export class DirectChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input("friend") friend: FriendModel;
  @Output("goBack") goBack = new EventEmitter();

  @ViewChild("chatBox") chatBox: ElementRef<HTMLUListElement>;

  messages: MessageModel[] = [];

  message = new FormControl("", Validators.required);

  user: UserModel = {} as UserModel;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService
  ) {
    this.authService.user.subscribe((user) => (this.user = user));
    this.chatService.messages$.subscribe(
      (messages) => (this.messages = messages)
    );
  }

  ngOnInit(): void {
    this.chatService.loadMessages(this.friend.user_id);
    this.chatService.handleConnect(this.friend.user_id);
  }

  ngOnDestroy(): void {
    this.chatService.handleDisconnect();
  }

  ngAfterViewInit(): void {
    this.chatService.messages$.subscribe((msg) => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 10);
    });
  }

  sendMessage() {
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

  private scrollToBottom() {
    this.chatBox.nativeElement.scrollTop =
      this.chatBox.nativeElement.scrollHeight;
  }
}
