import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SafePipe } from "./safe.pipe";
import { AvatarPipe } from "./avatar.pipe";
import { GLinkPipe } from "./glink.pipe";
import { TimeAgoPipe } from "./time-ago.pipe";

@NgModule({
  declarations: [SafePipe, AvatarPipe, GLinkPipe, TimeAgoPipe],
  imports: [CommonModule],
  exports: [SafePipe, AvatarPipe, GLinkPipe, TimeAgoPipe],
})
export class PipesModule {}
