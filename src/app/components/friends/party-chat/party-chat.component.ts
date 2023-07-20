import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { MessageModel } from 'src/app/models/message.model';
import { PartyModel } from 'src/app/models/party.model';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { GroupChatService } from 'src/app/services/group-chat.service';
import { PartyService } from 'src/app/services/party.service';
import { RestService } from 'src/app/services/rest.service';
import { memoize } from 'src/app/utils/memoize.util';

@Component({
  selector: 'app-party-chat',
  templateUrl: './party-chat.component.html',
  styleUrls: ['./party-chat.component.scss']
})
export class PartyChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input("partyId") partyId: string;

  @Output("goBack") goBack = new EventEmitter();

  @ViewChild("chatBox") chatBox: ElementRef<HTMLUListElement>;

  party: PartyModel = {} as PartyModel;
  user: UserModel = {} as UserModel;
  chats: MessageModel[] = [];
  message = new UntypedFormControl("", Validators.required);

  constructor(
    private readonly partyService: PartyService,
    private readonly authService: AuthService,
    private readonly restService: RestService,
    private readonly groupChatService: GroupChatService
  ) {
    this.authService.user.subscribe((user) => (this.user = user));
    this.groupChatService.messages$.subscribe((chats) => {
      this.chats = chats;
    });
  }

  ngOnInit(): void {
    this.party = this.partyService.getParty(this.partyId);
    this.groupChatService.loadMessages(this.partyId);
    this.groupChatService.handleConnect(this.partyId);
  }

  ngOnDestroy(): void {
    this.groupChatService.handleDisconnect();
  }

  ngAfterViewInit(): void {
    this.groupChatService.messages$.subscribe((msg) => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 10);
    });
  }

  sendMessage() {
    if (this.message.valid) {
      this.groupChatService.sendMessage(this.message.value, this.partyId);
      this.message.reset();
    }
  }

  @memoize()
  getSenderName(message: MessageModel) {
    if (message.sender === this.user.id) {
      return of(this.user.firstName + " " + this.user.lastName);
    }
    return this.restService.getName(message.sender);
  }

  isUserSender(message: MessageModel) {
    return message.sender === this.user.id;
  }

  private scrollToBottom() {
    this.chatBox.nativeElement.scrollTop =
      this.chatBox.nativeElement.scrollHeight;
  }

}
