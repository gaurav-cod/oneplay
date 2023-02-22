import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.scss']
})
export class ServerErrorComponent implements OnInit {

  constructor(private readonly location: Location) { }

  ngOnInit(): void {
  }

  onClick(): void {
    this.location.back();
  }
}
