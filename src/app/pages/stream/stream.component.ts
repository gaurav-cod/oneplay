import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit {
  chats = [
    {name: "Shilp187", photo: "assets/img/theme/team-1-800x800.jpg", message: "That was amazing!"},
    {name: "Arjun", photo: "assets/img/theme/team-2-800x800.jpg", message: "You gotta beat this level, come on!"},
    {name: "TarunX98", photo: "assets/img/theme/team-3-800x800.jpg", message: "Haha, He’s sure got it!"},
    {name: "Mats268", photo: "assets/img/theme/team-4-800x800.jpg", message: "KILL HIM! KILL HIM! KILL HIM!"},
    {name: "H78", photo: "assets/img/theme/team-1-800x800.jpg", message: "Haha he can’t do that without moving"},
    {name: "Ashley", photo: "assets/img/theme/team-2-800x800.jpg", message: "Wake me up tomorrow please"},
    {name: "Hash679", photo: "assets/img/theme/team-3-800x800.jpg", message: "How will they get out?"},
    {name: "Jacob90", photo: "assets/img/theme/team-4-800x800.jpg", message: "MOVE IT MOVE IT!!!"},
    {name: "PerryXnJ", photo: "assets/img/theme/team-1-800x800.jpg", message: "I bet the next level will be amazing "},
    {name: "Sam52", photo: "assets/img/theme/team-2-800x800.jpg", message: "WHAAAA 😮"},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
