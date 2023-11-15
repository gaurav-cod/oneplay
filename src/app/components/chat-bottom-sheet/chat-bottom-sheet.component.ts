import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";

@Component({
  selector: "app-chat-bottom-sheet",
  templateUrl: "./chat-bottom-sheet.component.html",
  styleUrls: ["./chat-bottom-sheet.component.scss"],
})
export class ChatBottomSheetComponent implements OnInit, OnDestroy {
  @Input("isCollapsed") isCollapsed: boolean;

  @Output() toggleCollapse = new EventEmitter();

  ngOnInit(): void {
    window.addEventListener("keyup", (e) => this.onPopState(e));
  }

  ngOnDestroy(): void {
    window.removeEventListener("keyup", (e) => this.onPopState(e));
  }

  private onPopState(e: KeyboardEvent) {
    if (!this.isCollapsed && e.keyCode === 27) {
      this.toggleCollapse.emit();
    }
  }

  toggle() {
    this.toggleCollapse.emit();
  }
}
