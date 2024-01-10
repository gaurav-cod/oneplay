import { NgModule } from "@angular/core";
import { BlurhashDirective } from "./blurhash.directive";

@NgModule({
    declarations: [BlurhashDirective],
    exports: [BlurhashDirective],
})
export class DirectivesModule {}