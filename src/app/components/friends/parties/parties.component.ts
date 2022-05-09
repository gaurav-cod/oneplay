import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { PartyModel } from "src/app/models/party.model";
import { PartyService } from "src/app/services/party.service";

@Component({
  selector: "app-parties",
  templateUrl: "./parties.component.html",
  styleUrls: ["./parties.component.scss"],
})
export class PartiesComponent implements OnInit {
  @Output("goBack") goBack = new EventEmitter();
  @Output("goToCreateParty") goToCreateParty = new EventEmitter();
  @Output("selectParty") selectParty = new EventEmitter<string>();

  parties: PartyModel[] = [];

  constructor(private readonly partyService: PartyService) {
    this.partyService.parties.subscribe((parties) => {
      this.parties = parties;
    });
  }

  ngOnInit(): void {}

  onSelectParty(party: PartyModel) {
    this.selectParty.emit(party.id);
  }
}
