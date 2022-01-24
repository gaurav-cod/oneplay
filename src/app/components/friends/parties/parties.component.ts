import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss']
})
export class PartiesComponent implements OnInit {
  @Output('goBack') goBack = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
