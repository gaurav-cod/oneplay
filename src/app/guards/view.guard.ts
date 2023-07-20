import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";
import { ViewComponent } from "../pages/view/view.component";

@Injectable()
export class ViewGuard implements CanDeactivate<ViewComponent> {
  canDeactivate(component: ViewComponent): boolean {
    return !component.startingGame;
  }
}
