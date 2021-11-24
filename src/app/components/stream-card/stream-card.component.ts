import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-stream-card",
  templateUrl: "./stream-card.component.html",
  styleUrls: ["./stream-card.component.scss"],
})
export class StreamCardComponent implements OnInit {
  @Input('id') id: string;
  @Input('image') image: string;
  @Input('title') title: string;
  @Input('avatar') avatar: string;
  @Input('player') player: string;

  constructor() {}

  ngOnInit(): void {}
}
