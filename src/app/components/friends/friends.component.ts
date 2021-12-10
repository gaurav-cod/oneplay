import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {
  @Input('isCollapsed') isCollapsed: boolean;

  @Output() toggleCollapse = new EventEmitter();

  _screens: Array<'main' | 'mail' | 'parties' | 'party'> = ['main'];
  selectedParty: string;

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

  goBack() {
    this._screens.pop();
  }
}
