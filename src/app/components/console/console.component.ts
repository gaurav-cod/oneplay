import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PcService } from "src/app/services/pc.service";

@Component({
  selector: "app-console",
  templateUrl: "./console.component.html",
  styleUrls: ["./console.component.scss"],
})
export class ConsoleComponent implements OnInit {
  public url = '';

  constructor(private readonly modalService: NgbModal, private readonly pcService: PcService) {
    pcService.pcInfo.subscribe(pc => {
      if (pc?.ipv4) {
        this.url = `https://www.oneplay.in/dashboard/console?ip=${pc.ipv4}`;
      } else {
        this.url = '';
      }
    });
  }

  ngOnInit(): void {}

  open(content) {
    this.modalService.open(content, { centered: true }).result;
  }
}
