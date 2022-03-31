import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  rate = 0;
  choice = 'Great Experience/Highly Recommend to friends & family';
  comment = '';

  options = [
    'Great Experience/Highly Recommend to friends & family',
    'Moderate lag/hang/latency, but mostly playable experience',
    'Too much lag/hang/latency and unplayable experience',
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
