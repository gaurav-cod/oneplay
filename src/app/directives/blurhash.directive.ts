// blurhash.directive.ts
import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { decode, isBlurhashValid } from "blurhash";
import { ImageHash } from "../models/game.model";

@Directive({
  selector: "[appBlurhash]",
})
export class BlurhashDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() hash: string;
  @Input() image: HTMLImageElement;

  constructor(private canvas: ElementRef<HTMLCanvasElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setStyle(this.image, 'opacity', '0');
  }

  ngAfterViewInit(): void {
    if (
      isBlurhashValid(this.hash).result
    ) {
      const width = this.canvas.nativeElement?.clientWidth * 2
      const height = this.canvas.nativeElement?.clientHeight * 2 
      const pixels = decode(this.hash, width, height);
      const ctx = this.canvas.nativeElement.getContext("2d");
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    }
    this.image.addEventListener('load', () => this.onImageLoad());
  }

  ngOnDestroy(): void {
    this.image.removeEventListener('load', this.onImageLoad);
  }

  private onImageLoad() {
    this.renderer.setStyle(this.image, 'opacity', '1');
    this.renderer.setStyle(this.canvas.nativeElement, 'display', 'none');
  }
}
