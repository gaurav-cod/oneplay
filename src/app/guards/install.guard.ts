import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { UAParser } from "ua-parser-js";

@Injectable()
export class InstallGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(): boolean {
    const uagent = new UAParser();

    if (
      uagent.getOS().name === "iOS" &&
      /safari/i.test(uagent.getBrowser().name)
    ) {
      return true;
    } else {
      this.router.navigate(["/home"], { replaceUrl: true });
      return false;
    }
  }
}
