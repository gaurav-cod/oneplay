import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SafePipe } from "./safe.pipe";
import { AvatarPipe } from "./avatar.pipe";

@NgModule({
  declarations: [SafePipe, AvatarPipe],
  imports: [CommonModule],
  exports: [SafePipe, AvatarPipe],
})
export class PipesModule {}
