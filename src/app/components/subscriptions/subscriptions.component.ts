import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {

  subscriptions = [
    {name: "Starter", amount: "199", device: "web", status: "active"},
    {name: "Elite", amount: "899", device: "web", status: "expired"},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
