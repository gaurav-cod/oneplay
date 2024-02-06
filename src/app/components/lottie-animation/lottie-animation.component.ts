import { Component } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-lottie-animation',
  templateUrl: './lottie-animation.component.html',
  styleUrls: ['./lottie-animation.component.scss']
})
export class LottieAnimationComponent {
  options: AnimationOptions = {
    path: 'assets/img/Dashboard/animation.json',
  };

  animationCreated(animationItem: AnimationItem): void {
  }
}
