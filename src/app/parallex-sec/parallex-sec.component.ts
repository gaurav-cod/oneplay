import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-parallex-sec',
  templateUrl: './parallex-sec.component.html',
  styleUrls: ['./parallex-sec.component.scss']
})
export class ParallexSecComponent {

  private lastScrollTop: number = 0;
  public marginValue: number = 1;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
      const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollTop) {
      this.marginValue += 4;
    } else {
      this.marginValue -= 4;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }
}
