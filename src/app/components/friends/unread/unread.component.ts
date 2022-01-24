import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-unread',
  templateUrl: './unread.component.html',
  styleUrls: ['./unread.component.scss']
})
export class UnreadComponent implements OnInit {
  @Output('goBack') goBack = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
