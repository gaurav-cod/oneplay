import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SafePipe } from "./safe.pipe";
import { AvatarPipe } from "./avatar.pipe";
import { GLinkPipe } from "./glink.pipe";
import { TimeAgoPipe } from "./time-ago.pipe";
import { StorePipe } from "./store.pipe";
import { TokensPipe } from "./tokens.pipe";
import { CurrencyPipe } from './currency.pipe';

@NgModule({
  declarations: [
    SafePipe,
    AvatarPipe,
    GLinkPipe,
    TimeAgoPipe,
    StorePipe,
    TokensPipe,
    CurrencyPipe,
  ],
  imports: [CommonModule],
  exports: [
    SafePipe,
    AvatarPipe,
    GLinkPipe,
    TimeAgoPipe,
    StorePipe,
    TokensPipe,
    CurrencyPipe,
  ],
})
export class PipesModule {}
