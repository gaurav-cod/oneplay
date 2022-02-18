import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SafePipe } from "./safe.pipe";
import { AvatarPipe } from "./avatar.pipe";
import { GLinkPipe } from "./glink.pipe";
import { TimeAgoPipe } from "./time-ago.pipe";
import { GameAssetPipe } from "./game-asset.pipe";
import { StorePipe } from "./store.pipe";

@NgModule({
  declarations: [
    SafePipe,
    AvatarPipe,
    GLinkPipe,
    TimeAgoPipe,
    GameAssetPipe,
    StorePipe,
  ],
  imports: [CommonModule],
  exports: [
    SafePipe,
    AvatarPipe,
    GLinkPipe,
    TimeAgoPipe,
    GameAssetPipe,
    StorePipe,
  ],
})
export class PipesModule {}
