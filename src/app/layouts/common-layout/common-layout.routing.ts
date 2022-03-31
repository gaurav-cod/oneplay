import { Routes } from "@angular/router";
import { ErrorComponent } from "src/app/pages/error/error.component";
import { FeedbackComponent } from "src/app/pages/feedback/feedback.component";

export const CommonLayoutRoutes: Routes = [
  { path: "error", component: ErrorComponent },
  { path: "quit", component: FeedbackComponent },
];
