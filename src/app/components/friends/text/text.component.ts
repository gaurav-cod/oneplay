import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { MediaQueries } from "src/app/utils/media-queries";

const paraHeight = MediaQueries.isMobile ? 21 * 12 : 26 * 12;

@Component({
  selector: "app-text",
  templateUrl: "./text.component.html",
  styleUrls: ["./text.component.scss"],
})
export class TextComponent implements AfterViewInit {
  @Input("text") text: string;

  @ViewChild("para") para: ElementRef<HTMLParagraphElement>;

  height = "auto";
  showReadMore = false;

  ngAfterViewInit(): void {
    if (this.para.nativeElement.clientHeight > paraHeight) {
      this.height = paraHeight + "px";
      this.showReadMore = true;
    }
  }

  readMore() {
    const diff =
      this.para.nativeElement.scrollHeight -
      this.para.nativeElement.clientHeight;
    this.height =
      this.para.nativeElement.clientHeight +
      (paraHeight > diff ? diff : paraHeight) +
      "px";
    this.showReadMore =
      this.para.nativeElement.scrollHeight >
      this.para.nativeElement.clientHeight;
  }
}
