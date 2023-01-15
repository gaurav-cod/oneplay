import { Component, TemplateRef } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-toasts",
  templateUrl: "./toasts.component.html",
  styleUrls: ["./toasts.component.scss"],
  host: {
    class: "toast-container position-fixed bottom-0 right-0 p-3",
    style: "z-index: 120000",
  },
})
export class ToastsComponent {
  constructor(public toastService: ToastService) {}

  isTemplate(toast) {
    return toast.textOrTpl instanceof TemplateRef;
  }
}
