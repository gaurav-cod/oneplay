import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PartyModel } from "src/app/models/party.model";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-party-settings",
  templateUrl: "./party-settings.component.html",
  styleUrls: ["./party-settings.component.scss"],
})
export class PartySettingsComponent implements OnInit {
  @Input("partyId") partyId: string;
  @Output("goBack") goBack = new EventEmitter();

  loading = false;
  party: PartyModel;

  partyForm = new FormGroup({
    name: new FormControl("", Validators.required),
    description: new FormControl("", Validators.required),
    type: new FormControl("", Validators.required),
  });

  constructor(
    private readonly restService: RestService,
    private readonly partyService: PartyService
  ) {}

  ngOnInit(): void {
    this.party = this.partyService.getParty(this.partyId);
    this.partyForm.patchValue(this.party);
  }

  onSubmit(): void {
    this.loading = true;
    const party = this.partyForm.value;
    this.restService.updateParty(this.party.id, party).subscribe(
      () => {
        this.partyService.updateParty(this.party.id, party);
        this.loading = false;
        this.goBack.emit();
      },
      (error) => {
        this.loading = false;
        Swal.fire({
          title: "Error",
          text: error,
          icon: "error",
        });
      }
    );
  }
}
