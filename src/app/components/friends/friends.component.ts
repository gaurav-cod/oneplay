import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FriendModel } from 'src/app/models/friend.model';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {
  @Input('isCollapsed') isCollapsed: boolean;

  @Output() toggleCollapse = new EventEmitter();

  _screens: Array<'main' | 'mail' | 'parties' | 'party' | 'chat'> = ['main'];
  selectedParty: string;
  selectedFriend: FriendModel;

  constructor() { }

  ngOnInit(): void {
  }

  get currentScreen() {
    return this._screens[this._screens.length - 1];
  }

  toggle() {
    this._screens = ['main'];
    this.toggleCollapse.emit();
  }

  selectParty(party: string) {
    this.selectedParty = party;
    this._screens.push('party');
  }

  goToMail() {
    this._screens.push('mail');
  }

  goToParties() {
    this._screens.push('parties');
  }

  goToChat(friend: FriendModel) {
    this.selectedFriend = friend;
    this._screens.push('chat');
  };

  goBack() {
    this._screens.pop();
  }
}
