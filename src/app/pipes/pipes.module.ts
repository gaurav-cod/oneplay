import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SafePipe } from "./safe.pipe";
import { AvatarPipe } from "./avatar.pipe";
import { GLinkPipe } from "./glink.pipe";

@NgModule({
  declarations: [SafePipe, AvatarPipe, GLinkPipe],
  imports: [CommonModule],
  exports: [SafePipe, AvatarPipe, GLinkPipe],
})
export class PipesModule {}
