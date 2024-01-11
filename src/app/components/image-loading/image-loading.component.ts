import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { decode, isBlurhashValid } from "blurhash";

@Component({
  selector: "image-loading",
  templateUrl: "./image-loading.component.html",
  styleUrls: ["./image-loading.component.scss"],
})
export class ImageLoadingComponent {
  @Input() hash: string;
  @Input() image: HTMLImageElement;

  @ViewChild("canvas")
  private canvas: ElementRef<HTMLCanvasElement>;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setStyle(this.image, "opacity", "0");
  }

  ngAfterViewInit(): void {
    if (isBlurhashValid(this.hash).result) {
      const pixels = decode(this.hash, 32, 32);
      const ctx = this.canvas.nativeElement.getContext("2d");
      const imageData = ctx.createImageData(32, 32);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    }
    this.image.addEventListener("load", () => this.onImageLoad());
  }

  ngOnDestroy(): void {
    this.image.removeEventListener("load", this.onImageLoad);
  }

  private onImageLoad() {
    this.renderer.setStyle(this.image, 'opacity', '1');
    this.renderer.setStyle(this.canvas.nativeElement, 'display', 'none');
  }
}
