import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-message',
  templateUrl: './success-message.component.html',
  styleUrls: ['./success-message.component.scss']
})
export class SuccessMessageComponent implements OnInit {

  constructor(
    private router: Router
  ) {
  }
  timer: number = 10;
  intervalRef: any;

  ngOnInit(): void {
    this.intervalRef = setInterval(()=> {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(this.intervalRef);
        this.goToLoginPage();
      }
    }, 1000);
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }
}
