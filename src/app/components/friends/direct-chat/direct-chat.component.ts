import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FriendModel } from 'src/app/models/friend.model';

@Component({
  selector: 'app-direct-chat',
  templateUrl: './direct-chat.component.html',
  styleUrls: ['./direct-chat.component.scss']
})
export class DirectChatComponent implements OnInit, OnDestroy {
  @Input('friend') friend: FriendModel;
  @Output('goBack') goBack = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
