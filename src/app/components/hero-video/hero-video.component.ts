import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-hero-video",
  templateUrl: "./hero-video.component.html",
  styleUrls: ["./hero-video.component.scss"],
})
export class HeroVideoComponent {
  @Input("isVideoMute") isVideoMute: boolean;
  @Input("src") src: string;
  @Output("videoEnded") videoEnded = new EventEmitter();

  @ViewChild("heroBannerVideo") heroBannerVideo: ElementRef<HTMLVideoElement>;

  @HostListener("window:scroll", [])
  onScroll(): void {
    // for infinite scroll
    // if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
    //   this.loadMoreRails();
    // }

    // pause video on scroll
    if (this.heroBannerVideo) {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollHeight = document.body.scrollHeight;
      const scrollPercentage =
        (scrollPosition / (scrollHeight - viewportHeight)) * 100;

      if (scrollPercentage >= 6) {
        this.heroBannerVideo.nativeElement.pause();
      } else {
        this.heroBannerVideo.nativeElement.play();
      }
    }
  }
}
